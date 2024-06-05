import { hookReactComponent } from '../utils/react-utils';
import { FRIEND_LIST_ELEM_ID } from './constant';
import { waitForUserLogined } from './zalo-utils';

export async function getFriendList() {
  await waitForUserLogined();

  const friends = await getFriends();

  return friends;
}

async function getFriends() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component = (await getFriendListComponent()) as any;

  return component?.memoizedProps.state?.contacts;
}

export async function getFriendListComponent() {
  const component = await hookReactComponent(FRIEND_LIST_ELEM_ID, 1);

  return component;
}
