import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../Profile/Avatar';
import moment from 'moment';

const SpoolMessageOneToOne = ({
  ownMessage,
  otherProfile,
  useArchivedData,
  body,
  from,
  messageDate
}) => {
  const renderMessageLead = () => {
    if (ownMessage)
      return (
        <p className="message-lead">
          <Link to="/user" className="green-link">
            you
          </Link>{' '}
          said to{' '}
          {useArchivedData ? (
            otherProfile.archived.displayName
          ) : (
            <Link to={`/user/${otherProfile.profileId}`} className="green-link">
              {otherProfile.profile.displayName}
            </Link>
          )}
          :
        </p>
      );

    return (
      <p className="message-lead">
        {useArchivedData ? (
          otherProfile.archived.displayName
        ) : (
          <Link to={`/user/${otherProfile.profileId}`} className="green-link">
            {otherProfile.profile.displayName}
          </Link>
        )}{' '}
        said to{' '}
        <Link to="/user" className="green-link">
          you:
        </Link>
      </p>
    );
  };

  const renderAvatar = () => {
    if (ownMessage)
      return (
        <Link to="/user">
          <Avatar avatar_id={from.avatar_id} />
        </Link>
      );

    return from.archived ? (
      <Avatar avatar_id={from.avatar_id} />
    ) : (
      <Link to={`/user/${from.profileId}`}>
        <Avatar avatar_id={from.avatar_id} />
      </Link>
    );
  };

  return (
    <div className="SpoolMessage">
      {renderAvatar()}
      <div className="message-body">
        {renderMessageLead()}

        <p className="message-text">{body}</p>
      </div>
      <div className="message-side">
        <div className="message-date">
          <span className="message-date-cal">
            {moment(messageDate).format('MMM DD, YYYY')}
          </span>
          <span className="message-date-time">
            {moment(messageDate).format('h:mmA')}
          </span>
        </div>

        {/* VIEW / SAVE / DELETE
        <div className="message-actions">
          <button className="button-reset green-link message-action">
            view
          </button>
          <span className="divider">|</span>
          <button className="button-reset green-link message-action">
            delete
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SpoolMessageOneToOne;
