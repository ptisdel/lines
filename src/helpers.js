import _ from 'lodash-es';

export const matchesFilterTag = (line, filterTag) => (
  _.includes(line.tags, filterTag)
  || line.tempTag === filterTag 
);