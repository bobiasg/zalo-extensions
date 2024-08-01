export interface ReactFiber {
  // Type of the component or DOM node (e.g., "div", "App", "Button")
  type: unknown;

  // Associated DOM node (if applicable)
  stateNode: ReactFiber | null;

  // Parent fiber in the tree
  return: ReactFiber | null;

  // First child fiber
  child: ReactFiber | null;

  // Next sibling fiber
  sibling: ReactFiber | null;

  // Position of this fiber in its parent's child array
  index: number;

  // Alternate fiber (the previous fiber representing this component)
  alternate: ReactFiber | null;

  // Memoized props and state (the latest props and state for this component)
  memoizedProps: unknown;
  memoizedState: unknown;

  // Expiration time (the deadline for when this component needs to be updated)
  expirationTime: number;

  // Effect tag (a bitmask that describes what side effects this component has)
  effectTag: number;
}

/**
 * Get react componnet from Dom
 * @param selector selector path
 * @param traverseUp traverse up level
 * @returns react component or null
 */
export async function hookReactComponentBySelector(selector: string, traverseUp = 0): Promise<ReactFiber | null> {
  try {
    const element = await waitForElementBySelector(selector);

    if (element != null) {
      const component = getFiberInstance(element, traverseUp);

      return component;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

/**
 * Helper function get all context for react component from Dom
 * @param selector selector path
 * @returns array of react context
 */
export async function getAllReactContext(selector: string): Promise<ReactFiber[]> {
  const contexts = [];
  try {
    const element = await waitForElementBySelector(selector);

    if (element != null) {
      let component = getFiberInstance(element, 0);
      while (component != null) {
        if (
          component != null &&
          (component.type as unknown as { $$typeof: unknown })?.$$typeof?.toString() == 'Symbol(react.provider)'
        ) {
          contexts.push(component);
        }
        component = getCompFiber(component);
      }
    }
  } catch (error) {
    console.error(error);
  }

  return contexts;
}

/**
 * Helper function wait for element by selector
 * @param selector
 * @param timeout
 * @returns
 */
function waitForElementBySelector(selector: string, timeout = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const interval = setInterval(() => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (counter >= timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for element selector: ${selector}`));
      }
      counter += 100;
    }, 100);
  });
}

/**
 * Find react component from Dom that has __reactFiber* or __reactInternalInstance prop
 * @param dom
 * @param traverseUp
 * @returns
 */
function getFiberInstance(dom: HTMLElement, traverseUp = 0): ReactFiber | null {
  const key = Object.keys(dom).find(key => {
    return (
      key.startsWith('__reactFiber$') || // react 17+
      key.startsWith('__reactInternalInstance$')
    ); // react <17
  });

  const domFiber = dom[key as keyof HTMLElement];
  if (domFiber == null) return null;

  // react <16
  // if (domFiber._currentElement) {
  //   let compFiber = domFiber._currentElement._owner;
  //   for (let i = 0; i < traverseUp; i++) {
  //     compFiber = compFiber._currentElement._owner;
  //   }
  //   return compFiber._instance;
  // }

  // react 16+
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  let compFiber = getCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = getCompFiber(compFiber);
  }

  return compFiber?.stateNode || compFiber;
}

/**
 *
 * @param fiber
 * @returns
 */
const getCompFiber = (fiber: ReactFiber | null): ReactFiber | null => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let parentFiber = fiber.return;
  while (typeof parentFiber?.type == 'string') {
    parentFiber = parentFiber.return;
  }

  return parentFiber;
};
