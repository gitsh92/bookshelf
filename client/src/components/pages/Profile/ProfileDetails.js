import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileDetailsFooter from './ProfileDetailsFooter';

const ProfileDetails = ({ profile }) => {
  const [seeMore, setSeeMore] = useState({
    isNeeded: profile && profile.aboutMe && profile.aboutMe.length > 400,
    show: true
  });

  const handleSeeMore = () => {
    setSeeMore({ ...seeMore, show: !seeMore.show });
  };

  if (!profile) return null;

  return (
    <div className="profile__main">
      <div className="profile__header">
        <h1 className="profile__header-text">
          {`${profile.displayName} ${profile.handle &&
            '(' + profile.handle + ')'} `}
          {profile.ownProfile && (
            <Link className="green-link edit-profile" to="/user/edit">
              (edit profile)
            </Link>
          )}
        </h1>
      </div>
      <div className="profile__body">
        {!profile.ownProfile && (
          <div className="profile__actions">
            <button className="btn btn--dark btn--action">Add friend</button>
            <button className="btn btn--light btn--action">Message</button>
          </div>
        )}
        <ul className="profile__details">
          {profile.name && (
            <li>
              <span className="text-bold">Name</span> {profile.name}
            </li>
          )}
          {profile.details && (
            <li>
              <span className="text-bold">Details</span> {profile.details}
            </li>
          )}
          {profile.birthday && (
            <li>
              <span className="text-bold">Birthday</span> {profile.birthday}
            </li>
          )}
          {profile.website && (
            <li>
              <span className="text-bold">Website</span>{' '}
              <a href={profile.website} className="green-link">
                {profile.website}
              </a>
            </li>
          )}
          <li>
            <span className="text-bold">Activity</span> {profile.activity}
          </li>
          {profile.interests && (
            <li>
              <span className="text-bold">Interests</span> {profile.interests}
            </li>
          )}
          {profile.favBooks && (
            <li>
              <span className="text-bold">Favorite Books</span>{' '}
              {profile.favBooks}
            </li>
          )}
          {profile.aboutMe && (
            <li>
              <span className="text-bold">About Me</span>{' '}
              <p>
                {seeMore.isNeeded && seeMore.show
                  ? profile.aboutMe.substring(0, 400) + '...'
                  : profile.aboutMe}{' '}
                {seeMore.isNeeded && (
                  <a className="green-link see-more" onClick={handleSeeMore}>
                    {seeMore.show ? '(See more)' : '(Show less)'}
                  </a>
                )}
              </p>
            </li>
          )}
        </ul>
      </div>
      <ProfileDetailsFooter social={profile.social} handle={profile.handle} />
    </div>
  );
};

export default ProfileDetails;
