import _ from 'lodash-es';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { matchesFilterTag, useInterval } from './helpers';
import * as constants from './constants';

// used to identify what changes to storage originate here
const instanceId = v4();

// initial data
const defaultNotes = {
  0: {
    tags: [],
    label: 'Work',
    lines: [],
  },
  1: {
    tags: [],
    label: 'Home',
    lines: [],
  },
};
const defaultData = JSON.stringify({
  lastUpdaterId: instanceId,
  notes: defaultNotes,
});

const saveData = notes => {
  const data = JSON.stringify({
    notes,
    lastUpdaterId: instanceId,
  });
  if (constants.CHROME_EXTENSION_MODE) {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.set({ data }, () => {});
    console.log('saving');
    return;
  }
  
  window.localStorage.setItem('data', data);
}

const loadData = callback => {
  if (constants.CHROME_EXTENSION_MODE) {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.get({ data: defaultData }, result => {
      const parsedData = JSON.parse(result.data);
      callback(parsedData.notes);
    });
    return;
  }

  callback(window.localStorage.getItem('data'));
}

export const useApp = () => {

  // initial state
    
  const [notes, setNotes] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [filterTag, setFilterTag] = useState(null);

  // load data

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const callback = notes => {
      setNotes(notes);
      setIsLoading(false);
    }

    // load initialize 
    loadData(callback);

    if (!constants.CHROME_EXTENSION_MODE) return;

    // if there are changes, and those changes include notesData, load notesData
    const listenForChanges = changes => {
      const parsedData = JSON.parse(changes?.data.newValue);
      const latestUpdaterId = parsedData.lastUpdaterId;
      const newNotes = parsedData.notes;
      if (latestUpdaterId !== instanceId && newNotes) callback(newNotes)
    };
    
    /* eslint-disable no-undef */
    chrome.storage.onChanged.addListener(listenForChanges);
    return () => chrome.storage.onChanged.removeListener(listenForChanges);
    /* eslint-enable no-undef */
  }, []);

  // select first available note
  useEffect(() => {
    if (notes === null) return;
    const noteIndices = _.keys(notes);
    const firstNoteIndex = _.head(noteIndices);
    if (currentNoteIndex === null) setCurrentNoteIndex(firstNoteIndex);
  }, [currentNoteIndex, notes]);
  
  // get all lines

  const currentNote = _.get(notes, currentNoteIndex);
  const allLineData = currentNote?.lines;
  const allLines = _.map(allLineData, lineData => lineData.text);
  const allTags = currentNote?.tags;

  // get unfiltered lines

  const unfilteredLineData = filterTag ? _.filter(allLineData, line => matchesFilterTag(line, filterTag)) : [];
  const unfilteredLines = _.map(unfilteredLineData, lineData => lineData.text);

  // get filtered lines 

  const filteredLineData = filterTag ? _.filter(allLineData, line => !matchesFilterTag(line, filterTag)) : [];
  
  // get visible text

  const visibleText = _.join(filterTag ? unfilteredLines : allLines, '\n');

  // editing a note starts a countdown to autosave

  const [saveCountdown, setSaveCountdown] = useState(null);
  useInterval(() => {
    if (_.isNull(saveCountdown)) return;

    setSaveCountdown(saveCountdown - 1);

    if (saveCountdown === 0) {
      setSaveCountdown(null)
      saveData(notes);
    }
  }, _.isNull(saveCountdown) ? null : 1000);

  const editNote = text => {
    const updatedLines = text?.split('\n');

    const updatedLineData = _.map(updatedLines, line => {
      const tags = line.match(/(#+[a-zA-Z0-9(_)]{1,})/g);
      const dedupedTags = _.uniq(tags);
    
      return {
        text: line,
        tags: dedupedTags,
        tempTag: filterTag,
      };
    });

    // including all updated lines along with old hidden lines, so nothing goes missing
    const newLineData = [
      ...updatedLineData,
      ...filteredLineData,
    ];
    
    // get entire note's data
    const newLines = _.map(newLineData, lineData => lineData.text);
    const newLinesAsText = _.join(newLines, '\n');
    const tags = newLinesAsText?.match(/(#+[a-zA-Z0-9(_)]{1,})/g); // collect hashtags
    const dedupedTags = _.uniq(tags);
    const sortedTags = _.sortBy(dedupedTags);

    // if current filter no longer has matches, clear filter
    if (!_.includes(dedupedTags, filterTag)) setFilterTag(null);

    const updatedNote = {
      tags: sortedTags,
      label: currentNote.label,
      lines: newLineData,
    };

    const newNotes = {
      ...notes,
      [currentNoteIndex]: updatedNote,
    };
    setNotes(newNotes);
    setSaveCountdown(3);
  };

  useEffect(() => {
    return () => {
      if (!isLoading) saveData(notes);
    };
  }, [isLoading, notes]);

  // filter notes by tags

  const clearTempTags = () => {
    const newLines = _.map(allLineData, line => ({
      ...line,
      tempTag: null,
    }));

    const newNote = {
      ...currentNote,
      lines: newLines,
    };

    const newNotes = {
      ...notes,
      [currentNoteIndex]: newNote,
    };

    setNotes(newNotes);
  };

  const selectTag = tag => {
    clearTempTags();

    if (filterTag === tag) {
      setFilterTag(null);
      return;
    }

    setFilterTag(tag);
  };

  function selectFirstNote(notesList) {
    const noteIndices = _.keys(notesList);
    const firstNoteIndex = _.head(noteIndices);
    selectNote(firstNoteIndex);
  }

  const selectNote = index => {
    clearTempTags();
    setCurrentNoteIndex(index);
  }

  // create modal

  const [showCreateModal, setShowCreateModal] = useState(false);

  const submitCreateModal = e => {
    e.preventDefault();

    const noteName = _.trim(e.target.elements.noteName.value);

    if (noteName) {
      const newNotes = {
        ...notes,
        [v4()]: {
          tags: [],
          label: noteName,
          lines: [],
        }
      };
      setNotes(newNotes);
      saveData(newNotes);
      setShowCreateModal(false);
    }
  }

  const cancelCreateModal = e => {
    e.preventDefault();
    setShowCreateModal(false);
  }

  // delete modal
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const submitDeleteModal = e => {
    e.preventDefault();

    // can't delete last note
    if (_.size(notes) <= 1) return;

    const newNotes = _.omit(notes, [currentNoteIndex]);
    selectFirstNote(newNotes);
    setNotes(newNotes);
    saveData(newNotes);
    setShowDeleteModal(false);
  }

  const cancelDeleteModal = e => {
    e.preventDefault();
    setShowDeleteModal(false)
  }

  return [
    {
      allTags,
      currentNote: {
        index: currentNoteIndex,
        label: currentNote?.label,
      },
      filterTag,
      isLoading,
      notes,
      showCreateModal,
      showDeleteModal,
      visibleText,
    },
    {
      cancelCreateModal,
      cancelDeleteModal,
      onEdit: e => editNote(e.target.value),
      openCreateModal: () => setShowCreateModal(true),
      openDeleteModal: () => setShowDeleteModal(true),
      selectNote,
      selectTag,
      submitCreateModal,
      submitDeleteModal,
    },
  ]
};
