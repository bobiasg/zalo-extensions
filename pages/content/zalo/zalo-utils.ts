import { waitForElement } from '@utils/react-utils';
import { APP_CONTAINER } from './constant';

//function get element by id, wait for it to be rendered or timeout
export async function waitForUserLogined(timeout = 5000) {
  return waitForElement(APP_CONTAINER, timeout);
}
