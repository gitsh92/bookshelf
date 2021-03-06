import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import profileReducer from './profile/profileReducer';
import searchReducer from './search/searchReducer';
import bookReducer from './book/bookReducer';
import authorReducer from './author/authorReducer';
import mailReducer from './mail/mailReducer';

export default combineReducers({
  auth: authReducer,
  profile: profileReducer,
  search: searchReducer,
  book: bookReducer,
  author: authorReducer,
  mail: mailReducer
});
