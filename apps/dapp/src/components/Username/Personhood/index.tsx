import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { Wrapper } from './styles';
import { VerifyCredential } from './verifyCredential';
import { OpenInNew } from 'components/Icons';
import { QuestionModal } from 'components/QuestionModal';
import { Card } from 'components/Card';
import { Loading } from 'components/Loading';
import { getCredential, getCredentials } from '../utils';
import { constants } from 'utils';

const DynamicShareWithModal = dynamic(
  () => import('../../ShareWithModal').then(c => c.ShareWithModal),
  {
    ssr: false
  }
);

// types
import { ICredential, IProfile } from 'utils/normalizeSchema';
import { Passport } from '@krebitdao/reputation-passport/dist/core/Passport';
import { Krebit as Issuer } from '@krebitdao/reputation-passport/dist/core/Krebit';

interface IProps {
  isAuthenticated: boolean;
  passport: Passport;
  publicPassport: Passport;
  issuer: Issuer;
  currentFilterOption: string;
  onFilterOption: (value: string) => void;
  isHidden: boolean;
  handleProfile: Dispatch<SetStateAction<IProfile>>;
}

export const Personhood = (props: IProps) => {
  const {
    isAuthenticated,
    passport,
    publicPassport,
    issuer,
    currentFilterOption,
    onFilterOption,
    isHidden,
    handleProfile
  } = props;
  const [status, setStatus] = useState('idle');
  const [personhoods, setPersonhoods] = useState<ICredential[]>([]);
  const [actionStatus, setActionStatus] = useState('idle');
  const [currentPersonhoodSelected, setCurrentPersonhoodSelected] =
    useState<ICredential>();
  const [currentActionType, setCurrentActionType] = useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(undefined);
  const [isVerifyCredentialOpen, setIsVerifyCredentialOpen] = useState(false);
  const [isShareWithModalOpen, setIsShareWithModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const isLoading = status === 'idle' || status === 'pending';
  const isCurrentUserAuthenticated = Boolean(passport?.did);

  useEffect(() => {
    if (!window) return;
    if (!publicPassport) return;
    if (!publicPassport?.idx) return;
    if (isHidden) return;

    getInformation();
  }, [publicPassport, currentFilterOption, isHidden]);

  const getInformation = async () => {
    setStatus('pending');
    // This is a temporary solution to determine if this component is loading or not, passing skills as undefined
    handleProfile(prevValues => ({
      ...prevValues,
      skills: undefined
    }));

    try {
      const personhoodCredentials = await getCredentials({
        type: 'Personhood',
        passport: publicPassport,
        limit: currentFilterOption === 'overview' ? 3 : 100
      });

      setPersonhoods(personhoodCredentials);
      handleProfile(prevValues => ({
        ...prevValues,
        skills:
          (prevValues.skills || [])?.concat(
            personhoodCredentials.flatMap(credential => credential.skills)
          ) || []
      }));
      setStatus('resolved');
    } catch (error) {
      console.error(error);
      setStatus('rejected');
    }
  };

  const updateSelectedCredential = async (vcId: string) => {
    if (!vcId) return;

    const personhoodCredential = await getCredential({
      vcId,
      type: 'Personhood',
      passport: publicPassport
    });

    setCurrentPersonhoodSelected(personhoodCredential);
  };

  const handleIsDropdownOpen = (id: string) => {
    if (isDropdownOpen === undefined || isDropdownOpen !== id) {
      setIsDropdownOpen(id);
    }

    if (isDropdownOpen !== undefined && isDropdownOpen === id) {
      setIsDropdownOpen(undefined);
    }
  };

  const handleIsVerifyCredentialOpen = () => {
    setIsVerifyCredentialOpen(prevState => !prevState);
    setCurrentPersonhoodSelected({
      credential: undefined,
      stamps: [],
      isMinted: false
    });
  };

  const handleIsShareWithModalOpen = () => {
    if (!isAuthenticated) return;

    setIsShareWithModalOpen(prevState => !prevState);
    setCurrentPersonhoodSelected({
      credential: undefined,
      stamps: [],
      isMinted: false
    });
  };

  const handleIsRemoveModalOpen = () => {
    if (!isAuthenticated) return;

    setIsRemoveModalOpen(prevState => !prevState);
    setActionStatus('idle');
  };

  const handleCurrentPersonhood = (type: string, values: ICredential) => {
    setCurrentPersonhoodSelected(values);
    setCurrentActionType(type);

    if (type === 'see_details') {
      setIsVerifyCredentialOpen(true);
    }

    if (type === 'share_with') {
      if (!isAuthenticated) return;
      setIsShareWithModalOpen(true);
    }

    if (type === 'remove_credential' || type === 'remove_stamp') {
      if (!isAuthenticated) return;
      setIsRemoveModalOpen(true);
    }

    if (type === 'decrypt' || type === 'encrypt') {
      if (!isCurrentUserAuthenticated) return;
      handleClaimValue(type, values.credential);
    }

    handleIsDropdownOpen(undefined);
  };

  const handleRemoveAction = async () => {
    if (!currentPersonhoodSelected) return;

    try {
      if (currentActionType === 'remove_credential') {
        setActionStatus('remove_pending');

        const response = await passport.removeCredential(
          currentPersonhoodSelected.credential?.vcId
        );

        if (response) {
          await getInformation();
          handleIsRemoveModalOpen();
        }
      }

      if (currentActionType === 'remove_stamp') {
        setActionStatus('remove_pending');

        const response = await issuer.removeStamp(
          currentPersonhoodSelected.stamps[0],
          'Stamp removed from Krebit.id'
        );

        if (response) {
          await getInformation();
          handleIsRemoveModalOpen();
        }
      }
    } catch (error) {
      console.error(error);
      setActionStatus('rejected');
    }
  };

  const handleClaimValue = async (type: string, credential: any) => {
    let claimValue = credential.value;

    if (type === 'decrypt') {
      claimValue = await issuer.decryptClaimValue(credential.value);
    }

    if (type === 'encrypt') {
      claimValue = await passport.getClaimValue(credential);
    }

    const currentCredentialPosition = personhoods.findIndex(
      personhood => personhood.credential.vcId === credential.vcId
    );

    if (currentCredentialPosition === -1) return;

    if (claimValue) {
      const updatedPersonhoods = [...personhoods];
      updatedPersonhoods[currentCredentialPosition] = {
        ...updatedPersonhoods[currentCredentialPosition],
        credential: {
          ...updatedPersonhoods[currentCredentialPosition].credential,
          value: claimValue
        }
      };

      setCurrentPersonhoodSelected(prevValues => ({
        ...prevValues,
        credential: {
          ...prevValues.credential,
          value: claimValue
        }
      }));
      setPersonhoods(updatedPersonhoods);
    }
  };

  const formatCredentialName = (value: any) => {
    if (value?.encryptedString) return '******';

    let formattedValue = '';

    if (value?.date) {
      const [yyyy, mm, dd] = value?.date.split(/-/g);
      formattedValue = `${mm}/${dd}/${yyyy}`;
    }

    if (value?.protocol === 'Email') {
      formattedValue = formattedValue
        ?.concat(' / ')
        ?.concat(value.username)
        ?.concat('@')
        ?.concat(value.host);
    }

    if (value?.username) {
      formattedValue = formattedValue
        ?.concat(' / ')
        ?.concat('@')
        ?.concat(value.username);
    }

    if (value?.fullName) {
      formattedValue = formattedValue?.concat(' / ')?.concat(value.fullName);
    }

    if (value?.id) {
      formattedValue = formattedValue?.concat(' / ')?.concat(value.id);
    }

    if (value?.countryCode) {
      formattedValue = formattedValue
        ?.concat(' / ')
        ?.concat(`+${value?.countryCode}${value?.number}`);
    }

    return formattedValue;
  };

  const formatCredentialType = (value: any) => {
    return value
      .replace('Github', ' Github')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace('#', '# ')
      .replace('++', '++ ')
      .replace('GT', '> ');
  };

  return (
    <>
      {isVerifyCredentialOpen ? (
        <VerifyCredential
          isAuthenticated={isAuthenticated}
          credential={currentPersonhoodSelected}
          getInformation={getInformation}
          updateCredential={updateSelectedCredential}
          onClose={handleIsVerifyCredentialOpen}
          formatCredentialName={formatCredentialName}
          formatLitValue={handleClaimValue}
        />
      ) : null}
      {isShareWithModalOpen ? (
        <DynamicShareWithModal
          currentPersonhood={currentPersonhoodSelected}
          issuer={issuer}
          onClose={handleIsShareWithModalOpen}
        />
      ) : null}
      {isRemoveModalOpen ? (
        <QuestionModal
          title="Remove Credential?"
          text="This action can't be undone."
          continueButton={{
            text: 'Delete',
            onClick: handleRemoveAction
          }}
          cancelButton={{ text: 'Cancel', onClick: handleIsRemoveModalOpen }}
          isLoading={actionStatus === 'remove_pending'}
        />
      ) : null}
      <Wrapper isHidden={isHidden} currentFilterOption={currentFilterOption}>
        <div className="person-header">
          <div className="person-header-text-container">
            <p className="person-header-text">Personhood Credentials</p>
            {currentFilterOption === 'overview' ? (
              <div
                className="person-header-text-open-new"
                onClick={() => onFilterOption('Personhood')}
              >
                <OpenInNew />
              </div>
            ) : null}
          </div>
          {isAuthenticated && (
            <p
              className="person-header-verify"
              onClick={handleIsVerifyCredentialOpen}
            >
              Verify
            </p>
          )}
        </div>
        <div className="cards-box">
          {isLoading ? (
            <>
              <div className="personhood-card-loading">
                <Loading type="skeleton" />
              </div>
              <div className="personhood-card-loading">
                <Loading type="skeleton" />
              </div>
            </>
          ) : personhoods?.length === 0 ? (
            new Array(2)
              .fill(constants.DEFAULT_EMPTY_CARD_PERSONHOOD)
              .map((personhood, index) => (
                <Card
                  key={index}
                  type="simple"
                  id={`personhood_${index}`}
                  isEmpty={true}
                  {...personhood}
                />
              ))
          ) : (
            personhoods.map((personhood, index) => (
              <Card
                key={index}
                type="simple"
                id={`personhood_${index}`}
                icon={personhood.credential?.visualInformation?.icon}
                title={formatCredentialType(
                  personhood.credential?.credentialSubject?.type
                )}
                description={formatCredentialName(personhood.credential?.value)}
                dates={{
                  issuanceDate: {
                    text: 'ISSUED',
                    value: personhood.credential?.issuanceDate
                  },
                  expirationDate: {
                    text: 'EXPIRES',
                    value: personhood.credential?.expirationDate
                  }
                }}
                dropdown={{
                  isDropdownOpen,
                  onClick: () => handleIsDropdownOpen(`personhood_${index}`),
                  onClose: () => handleIsDropdownOpen(undefined),
                  items: [
                    {
                      title: 'See details',
                      onClick: () =>
                        handleCurrentPersonhood('see_details', personhood)
                    },
                    isAuthenticated &&
                    personhood.credential?.visualInformation
                      .isEncryptedByDefault
                      ? {
                          title: 'Share with',
                          onClick: () =>
                            handleCurrentPersonhood('share_with', personhood)
                        }
                      : undefined,
                    isCurrentUserAuthenticated &&
                    personhood.credential?.visualInformation
                      .isEncryptedByDefault
                      ? personhood.credential?.value?.encryptedString
                        ? {
                            title: 'Decrypt',
                            onClick: () =>
                              handleCurrentPersonhood('decrypt', personhood)
                          }
                        : {
                            title: 'Encrypt',
                            onClick: () =>
                              handleCurrentPersonhood('encrypt', personhood)
                          }
                      : undefined,
                    isAuthenticated && personhood.stamps?.length === 0
                      ? {
                          title: 'Remove credential',
                          onClick: () =>
                            handleCurrentPersonhood(
                              'remove_credential',
                              personhood
                            )
                        }
                      : undefined,
                    isAuthenticated &&
                    personhood.credential &&
                    personhood.stamps?.length !== 0
                      ? {
                          title: 'Remove stamp',
                          onClick: () =>
                            handleCurrentPersonhood('remove_stamp', personhood)
                        }
                      : undefined
                  ]
                }}
                isIssued={
                  personhood.credential && personhood.stamps?.length > 0
                }
                tooltip={{
                  message: `This credential has ${
                    personhood.stamps?.length || 0
                  } stamps`
                }}
              />
            ))
          )}
        </div>
      </Wrapper>
    </>
  );
};
