import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../Profile/Avatar';
import moment from 'moment';

const SpoolMessageGroup = ({ ownMessage, from, body, messageDate }) => {
  const renderMessageLead = ownMessage => {
    if (ownMessage)
      return (
        <p className="message-lead">
          <Link to="/user" className="green-link">
            you
          </Link>{' '}
          said
        </p>
      );

    return (
      <p className="message-lead">
        {from.archived ? (
          from.displayName
        ) : (
          <Link to={`/user/${from.profileId}`} className="green-link">
            {from.displayName}
          </Link>
        )}{' '}
        said
      </p>
    );
  };

  return (
    <div className="SpoolMessage">
      <Avatar avatar_id={from.avatar_id} />
      <div className="message-body">
        {renderMessageLead(ownMessage)}

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

        <div className="message-actions">
          {/* VIEW / SAVE / DELETE */}
          <button className="button-reset green-link message-action">
            view
          </button>
          <span className="divider">|</span>
          <button className="button-reset green-link message-action">
            delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpoolMessageGroup;
