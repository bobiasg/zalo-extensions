export async function hookReactComponent(id: string, traverseUp = 0) {
  try {
    const element = await waitForElement(id);

    if (element != null) {
      const component = getFiberInstance(element, traverseUp);

      return component;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function hookReactComponentBySelector(selector: string, traverseUp = 0) {
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

export function waitForElement(id: string, timeout = 5000): Promise<HTMLElement | null> {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const interval = setInterval(() => {
      const element = document.getElementById(id);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (counter >= timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for element with id ${id}`));
      }
      counter += 100;
    }, 100);
  });
}

export function waitForElementBySelector(selector: string, timeout = 5000): Promise<HTMLElement | null> {
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

export function getFiberInstance(dom: HTMLElement, traverseUp = 0) {
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
  const getCompFiber = fiber => {
    let parentFiber = fiber.return;
    while (typeof parentFiber.type == 'string') {
      parentFiber = parentFiber.return;
    }

    return parentFiber;
  };
  let compFiber = getCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = getCompFiber(compFiber);
  }

  return compFiber.stateNode || compFiber;
}
