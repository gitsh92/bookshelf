import React, { useState, useEffect } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import FriendCurrentRead from './FriendCurrentRead';
import Pagination from '../../common/Pagination';
import Loader from '../../common/Loader';
import { useSelector } from 'react-redux';
import withUpdatingRating from '../Profile/withUpdatingRating';
import queryString from 'query-string';
import { useLayoutEffect } from 'react';

const FriendsReading = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const token = useSelector(state => state.auth.token);
  const location = useLocation();
  // fetch user profile with friends' current reads
  const fetchData = async () => {
    const uri = 'http://localhost:5000/api/v1/profile/friends/reading';
    const res = await fetch(uri, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    const json = await res.json();

    if (json.status === 'success') {
      setProfile(json.data.profile);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setLoading(false);
      setBooksView({ books: createBookList(), startIndex: 0, endIndex: 15 });
    } else {
      fetchData();
    }
  }, [profile]);

  const [booksView, setBooksView] = useState({
    books: [],
    startIndex: 0,
    endIndex: 15
  });

  useLayoutEffect(() => {
    if (!booksView.books.length) {
      return;
    }
    const parsed = queryString.parse(location.search);
    const startIndex = (parsed.page - 1) * 15 || 0;
    const endIndex = parsed.page * 15 || 15;
    setBooksView({ ...booksView, startIndex, endIndex });
  }, [location]);

  const createBookList = () => {
    let books = [];
    profile.friends.forEach(fr => {
      const friendBooks = fr.profile.books.map(book => ({
        dateShelved: book.dateShelved,
        friendId: fr.profileId,
        friendName: fr.profile.displayName,
        ...book.bookId
      }));
      books = books.concat(friendBooks);
    });

    // sort by dateShelved, most recently first
    books = books.sort(
      (b1, b2) => new Date(b2.dateShelved) - new Date(b1.dateShelved)
    );
    return books;
  };

  const getPaginationSettings = () => {
    const parsed = queryString.parse(location.search);
    let page = parseInt(parsed['page']) || 1;
    page = page <= 0 ? 1 : page;
    return {
      perPage: 15,
      total: profile.friends.length,
      page,

      useQueryParam: true,
      noLimit: true
    };
  };

  if (!loading && !profile) {
    return <Redirect to="/something-went-wrong" />;
  }

  return (
    <div className="FriendsReading page-container">
      <div className="container">
        <main>
          <h1>
            <Link to="/user/friends" className="green-link">
              Friends
            </Link>{' '}
            > Reading
          </h1>
          <h2>Books My Friends Are Reading</h2>
          {loading ? (
            <Loader />
          ) : (
            <div className="FriendsReading__list">
              <div className="FriendsReading__pagination">
                <Pagination {...getPaginationSettings()} />
              </div>
              {booksView.books
                .slice(booksView.startIndex, booksView.endIndex)
                .map(book => {
                  const CurrentReadWithUpdatingRating = withUpdatingRating(
                    FriendCurrentRead
                  );
                  return (
                    <CurrentReadWithUpdatingRating
                      key={book.friendId}
                      props={{
                        ...book
                      }}
                    />
                  );
                })}
              <div className="FriendsReading__pagination">
                <Pagination {...getPaginationSettings()} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FriendsReading;
