import React from 'react';
import StatePagination from '../../common/StatePagination';
import { useSelector } from 'react-redux';
import SpoolMessageOneToOne from './SpoolMessageOneToOne';
import SpoolMessageGroup from './SpoolMessageGroup';

const Spool = ({
  spool,
  totalMessages,
  perPage = 20,
  page,
  setPage,
  profileMap
}) => {
  const ownProfileId = useSelector(state => state.auth.user.profile.id);
  const isOneToOne = spool.profiles.length === 2;

  const renderSpool = oneToOne => {
    if (oneToOne) {
      const otherProfile = spool.profiles.find(
        prof => prof.profileId !== ownProfileId
      );
      const useArchivedData = !otherProfile.profile; // if profile has been deleted, profile field is undefined

      return spool.messages.map(msg => (
        <SpoolMessageOneToOne
          key={msg._id}
          ownMessage={msg.from === ownProfileId}
          from={profileMap[msg.from]}
          otherProfile={otherProfile}
          useArchivedData={useArchivedData}
          body={msg.body}
          messageDate={new Date(msg.dateCreated)}
        />
      ));
    } else {
      return spool.messages.map(msg => (
        <SpoolMessageGroup
          key={msg._id}
          ownMessage={msg.from === ownProfileId}
          from={profileMap[msg.from]}
          profileMap={profileMap}
          body={msg.body}
          messageDate={new Date(msg.dateCreated)}
          // profiles={spool.profiles}
        />
      ));
    }
  };

  return (
    <div className="MessageSpool__spool">
      <div className="pagination pagination-top">
        <StatePagination
          page={page}
          setPage={setPage}
          total={totalMessages}
          noLimit
          perPage={perPage}
          ownProfileId={ownProfileId}
        />
      </div>
      {renderSpool(isOneToOne)}

      <div className="pagination pagination-bottom">
        <StatePagination
          page={page}
          setPage={setPage}
          total={totalMessages}
          noLimit
          perPage={perPage}
          ownProfileId={ownProfileId}
        />
      </div>
    </div>
  );
};

export default Spool;
