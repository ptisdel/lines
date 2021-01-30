import _ from 'lodash-es';
import { useEffect, useRef } from 'react';

export const matchesFilterTag = (line, filterTag) => (
  _.includes(line.tags, filterTag)
  || line.tempTag === filterTag 
);

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
