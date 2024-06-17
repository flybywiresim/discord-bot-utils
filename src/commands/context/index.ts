import { ContextMenuCommand } from '../../lib';
import userInfo from './user/userInfo';
import reportMessage from './message/reportMessage';
import listInfractions from './user/listInfractions';

const contextArray: ContextMenuCommand[] = [userInfo, reportMessage, listInfractions];

export default contextArray;
