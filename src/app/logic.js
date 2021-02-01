import _ from 'lodash-es';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import * as helpers from '../helpers';

const {
  isElectronModeEnabled,
} = helpers.electron;

const {
  isChromeModeEnabled,
  listenToChromeStorageChanges,
  loadChromeStorageData,
  saveChromeStorageData,
} = helpers.chromeExtension;

const {
  isWebappModeEnabled,
  loadLocalStorageData,
  saveLocalStorageData,
} = helpers.webapp;

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
  if (isChromeModeEnabled) saveChromeStorageData({ data });
  if (isWebappModeEnabled || isElectronModeEnabled) saveLocalStorageData({ data });
}

const loadData = callback => {
  if (isChromeModeEnabled) loadChromeStorageData({ callback, defaultData });
  if (isWebappModeEnabled || isElectronModeEnabled) loadLocalStorageData({ callback, defaultData });
}

const useApp = () => {
  // initial state

  const [notes, setNotes] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [filterTag, setFilterTag] = useState(null);

  // load data

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const callback = callbackData => {
      const callbackNotes = callbackData?.notes;
      setNotes(callbackNotes);
      setIsLoading(false);
    }

    // load initial data
    loadData(callback);

    // subscribe to future data updates
    if (isChromeModeEnabled) return listenToChromeStorageChanges({ callback, instanceId });
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
  const allLines = _.map(allLineData, (lineData) => lineData.text);
  const allTags = currentNote?.tags;

  // get unfiltered lines

  const unfilteredLineData = filterTag
    ? _.filter(allLineData, (line) => helpers.shared.matchesFilterTag(line, filterTag))
    : [];
  const unfilteredLines = _.map(unfilteredLineData, (lineData) => lineData.text);

  // get filtered lines

  const filteredLineData = filterTag
    ? _.filter(allLineData, (line) => !helpers.shared.matchesFilterTag(line, filterTag))
    : [];

  // get visible text

  const visibleText = _.join(filterTag ? unfilteredLines : allLines, '\n');

  // editing a note starts a countdown to autosave

  const [saveCountdown, setSaveCountdown] = useState(null);
  helpers.shared.useInterval(() => {
    if (_.isNull(saveCountdown)) return;

    setSaveCountdown(saveCountdown - 1);

    if (saveCountdown === 0) {
      setSaveCountdown(null)
      saveData(notes);
    }
  }, _.isNull(saveCountdown) ? null : 150); // 0.15s intervals

  // editing a note starts a save countdown

  const editNote = text => {
    const updatedLines = text?.split('\n');

    const updatedLineData = _.map(updatedLines, (line) => {
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
    const newLines = _.map(newLineData, (lineData) => lineData.text);
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
    setSaveCountdown(1);
  };

  // filter notes by tags

  const clearTempTags = () => {
    const newLines = _.map(allLineData, (line) => ({
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

  const selectTag = (tag) => {
    clearTempTags();

    if (filterTag === tag) {
      setFilterTag(null);
      return;
    }

    setFilterTag(tag);
  };

  const selectNote = (index) => {
    clearTempTags();
    setCurrentNoteIndex(index);
  }

  function selectFirstNote(notesList) {
    const noteIndices = _.keys(notesList);
    const firstNoteIndex = _.head(noteIndices);
    selectNote(firstNoteIndex);
  }

  // create modal

  const [showCreateModal, setShowCreateModal] = useState(false);

  const submitCreateModal = (e) => {
    e.preventDefault();

    const noteName = _.trim(e.target.elements.noteName.value);

    if (noteName) {
      const newNotes = {
        ...notes,
        [v4()]: {
          tags: [],
          label: noteName,
          lines: [],
        },
      };
      setNotes(newNotes);
      saveData(newNotes);
      setShowCreateModal(false);
    }
  }

  const cancelCreateModal = (e) => {
    e.preventDefault();
    setShowCreateModal(false);
  }

  // delete modal

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const submitDeleteModal = (e) => {
    e.preventDefault();

    // can't delete last note
    if (_.size(notes) <= 1) return;

    const newNotes = _.omit(notes, [currentNoteIndex]);
    selectFirstNote(newNotes);
    setNotes(newNotes);
    saveData(newNotes);
    setShowDeleteModal(false);
  }

  const cancelDeleteModal = (e) => {
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
      onEdit: (e) => editNote(e.target.value),
      openCreateModal: () => setShowCreateModal(true),
      openDeleteModal: () => setShowDeleteModal(true),
      selectNote,
      selectTag,
      submitCreateModal,
      submitDeleteModal,
    },
  ]
};

export default useApp;
