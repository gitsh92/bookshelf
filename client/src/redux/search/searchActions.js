import store from '../../redux/store';
import {
  SEARCH_BOOKS_SUCCESS,
  SEARCH_BOOKS_FAILURE,
  CLEAR_SEARCH_STATUS
} from './searchTypes';

export const searchBooks = (query, filter, page) => async dispatch => {
  let uri = '/api/v1/search';

  // TODO: check params, return early if invalid?

  const token = store.getState().auth.token;

  // ***** FOLLOWING LINES BREAK WHEN DEPLOYED ******
  // let url = new URL(uri);
  // url.search = new URLSearchParams({ q: query, 'search[field]': filter, page });
  // url = url.toString();

  const url = `${uri}?q=${query}&search[field]=${filter}&page=${page}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const json = await res.json();

  if (json.status === 'success') {
    dispatch({
      type: SEARCH_BOOKS_SUCCESS,
      payload: json.data
    });
  } else {
    dispatch({
      type: SEARCH_BOOKS_FAILURE
    });
  }
};

export const clearSearchStatus = () => ({ type: CLEAR_SEARCH_STATUS });
