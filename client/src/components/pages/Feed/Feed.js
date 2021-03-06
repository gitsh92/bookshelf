import React from 'react';
import { withRouter } from 'react-router-dom';
import CurrentlyReading from './CurrentlyReading';
import FeedUpdate from './FeedUpdate';
import useLoadProfile from '../Profile/Hooks/useLoadProfile';
import Loader from '../../common/Loader';

const Feed = () => {
  // load own profile
  const [loadingProfile, profile] = useLoadProfile();

  if (loadingProfile) return <Loader />;

  return (
    <div className="Feed page-container">
      <div className="Feed__container">
        <aside className="sidebar--feed">
          <section className="sidebar--feed__panel">
            <h3>Currently reading </h3>
            <CurrentlyReading />
            <div className="sidebar--feed__panel-footer">
              <a href="#!" className="green-link">
                See more
              </a>
              <span className="middle-dot">&#183;</span>
              <a href="#!" className="green-link">
                Add a book
              </a>
            </div>
          </section>
          <section className="sidebar--feed__panel">
            <h3>Want to read</h3>
          </section>
          <section className="sidebar--feed__panel">
            <h3>Bookshelves</h3>
          </section>
        </aside>
        <main>
          <h2>Updates</h2>
          <FeedUpdate />
        </main>
      </div>
    </div>
  );
};

export default withRouter(Feed);
