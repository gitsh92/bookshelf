import {
  PREPARE_LOAD_PROFILE,
  CLEAR_PROFILE,
  LOAD_PROFILE_SUCCESS,
  LOAD_PROFILE_FAILURE,
  EDIT_PROFILE_SUCCESS,
  EDIT_PROFILE_FAILURE,
  CLEAR_EDIT_STATUS,
  SHELVE_BOOK
} from './profileTypes';
import store from '../../redux/store';
import { PROFILE_WAS_UPDATED } from '../auth/authTypes';

export const prepareGetProfile = () => ({
  type: PREPARE_LOAD_PROFILE
});
export const clearProfile = () => ({
  type: CLEAR_PROFILE
});
export const clearEditStatus = () => ({
  type: CLEAR_EDIT_STATUS
});

// profileId optional
export const getProfile = profileId => async dispatch => {
  let uri = 'http://localhost:5000/api/v1/profile';
  if (profileId) {
    uri = `${uri}/${profileId}`;
  }

  const token = store.getState().auth.token;
  const res = await fetch(uri, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const json = await res.json();

  if (json.status === 'success') {
    dispatch({
      type: LOAD_PROFILE_SUCCESS,
      payload: json
    });
  } else {
    dispatch({
      type: LOAD_PROFILE_FAILURE
    });
  }
};

export const editProfile = updatedProfile => async dispatch => {
  // make call to api
  // dispatch success or failure, depending upon backend validation

  const uri = 'http://localhost:5000/api/v1/profile';
  const token = store.getState().auth.token;

  const res = await fetch(uri, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedProfile)
  });
  const json = await res.json();
  if (json.status === 'success') {
    dispatch({
      type: PROFILE_WAS_UPDATED,
      payload: json.data.user
    });

    dispatch({
      type: EDIT_PROFILE_SUCCESS,
      payload: json.data.profile
    });
  } else {
    dispatch({
      type: EDIT_PROFILE_FAILURE,
      payload: json
    });
  }
};

export const editAvatar = formData => async dispatch => {
  const token = store.getState().auth.token;
  const res = await fetch('http://localhost:5000/api/v1/profile/avatar', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const json = await res.json();

  if (json.status === 'success') {
    dispatch({
      type: PROFILE_WAS_UPDATED,
      payload: json.data.user
    });
    dispatch({
      type: EDIT_PROFILE_SUCCESS,
      payload: json.data.profile
    });
  } else {
    dispatch({
      type: EDIT_PROFILE_FAILURE,
      payload: json
    });
  }
};

export const deleteAvatar = () => async dispatch => {
  const token = store.getState().auth.token;
  const res = await fetch('http://localhost:5000/api/v1/profile/avatar', {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const json = await res.json();

  if (json.status === 'success') {
    dispatch({
      type: PROFILE_WAS_UPDATED,
      payload: json.data.user
    });
    dispatch({
      type: EDIT_PROFILE_SUCCESS,
      payload: json.data.profile
    });
  } else {
    dispatch({
      type: EDIT_PROFILE_FAILURE,
      payload: json
    });
  }
};

export const shelveBook = (bookData, shelf) => async dispatch => {
  const body = { shelf, ...bookData };

  const token = store.getState().auth.token;
  const res = await fetch('http://localhost:5000/api/v1/profile/bookshelves', {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  // console.log(bookData, shelf);

  const json = await res.json();
};

export const rateBook = (bookData, rating) => async dispatch => {
  const body = { rating, ...bookData };

  const token = store.getState().auth.token;
  const res = await fetch('http://localhost:5000/api/v1/profile/rating', {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  // console.log(bookData, shelf);

  const json = await res.json();
  console.log(json);
};
