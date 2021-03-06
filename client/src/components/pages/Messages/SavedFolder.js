import React, { useState, useEffect } from 'react';
import Folder from './Folder';
import useMailboxAlert, { writeAlertText } from './hooks/useMailboxAlert';
import useLoadMail, { MailFolder } from './hooks/useLoadMail';
import { useSelector, useDispatch } from 'react-redux';
import {
  unsaveMail,
  trashMail,
  markRead
} from '../../../redux/mail/mailActions';
import Loader from '../../common/Loader';

const SavedFolder = () => {
  const dispatch = useDispatch();
  const [action, setAction] = useState('');
  const [alertCache, alert, dismissAlert] = useMailboxAlert();

  const [loadingMail, mail] = useLoadMail(MailFolder.SAVED);
  const numSaved = useSelector(state => state.mail.mailbox.numSaved);

  const [checkedMessages, setCheckedMessages] = useState({});
  // uncheck messages after each action
  useEffect(() => {
    setCheckedMessages({});
  }, [loadingMail]);

  const checkBatch = (check, ...messageIds) => {
    setCheckedMessages(oldState => {
      const newState = { ...oldState };
      messageIds.forEach(_id => {
        newState[_id] = check;
      });
      return newState;
    });
  };

  const checkMessages = (...messageIds) => checkBatch(true, ...messageIds);
  const uncheckMessages = (...messageIds) => checkBatch(false, ...messageIds);

  const handleAction = e => {
    const numChecked = Object.values(checkedMessages).filter(v => v).length;
    if (numChecked === 0) return;
    const messages = mail.filter(msg => checkedMessages[msg._id]);

    switch (e.target.value) {
      case 'inbox':
        dispatch(unsaveMail(messages));
        alertCache.current = writeAlertText(
          writeAlertText.MOVE_TO_INBOX,
          numChecked
        );
        break;
      case 'trash':
        dispatch(trashMail(messages));
        alertCache.current = writeAlertText(
          writeAlertText.SEND_TO_TRASH,
          numChecked
        );
        break;
      case 'read':
        dispatch(markRead(messages));
        alertCache.current = writeAlertText(
          writeAlertText.MARK_READ,
          numChecked
        );
        break;
    }
    setAction('');
  };

  return loadingMail ? (
    <Loader />
  ) : (
    <Folder
      messages={mail}
      loading={loadingMail}
      title="Saved messages"
      totalMessages={numSaved}
      path="/message/saved"
      checkMessages={checkMessages}
      uncheckMessages={uncheckMessages}
      checkedMessages={checkedMessages}
      alert={alert}
      dismissAlert={dismissAlert}
    >
      <select
        name="actions"
        className="actions-dropdown"
        onChange={handleAction}
        value={action}
      >
        <option value="">actions...</option>
        <option value="inbox">move to inbox</option>
        <option value="trash">move to trash</option>
        <option value="read">mark as read</option>
      </select>
    </Folder>
  );
};

export default SavedFolder;
