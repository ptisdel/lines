import _ from 'lodash-es';
import React from 'react';
import './app.css';
import useApp from './app-hook';

function App() {
  const [{
    allTags,
    currentNote,
    filterTag,
    isLoading,
    notes,
    showCreateModal,
    showDeleteModal,
    visibleText,
  }, {
    cancelCreateModal,
    cancelDeleteModal,
    openCreateModal,
    openDeleteModal,
    onEdit,
    selectNote,
    selectTag,
    submitCreateModal,
    submitDeleteModal,
  }] = useApp();

  const CreateModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            Name Your Note
          </div>
        </div>
        <form className="modal-form" onSubmit={submitCreateModal}>
          <input autoFocus className="modal-input" maxLength="10" name="noteName" type="text" />
          <input className="modal-submit-button" value="Submit" type="submit" />
          <button className="modal-close-button" onClick={cancelCreateModal} type="button">Cancel</button>
        </form>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {`Delete '${currentNote.label}'?`}
          </div>
        </div>
        <form className="modal-form" onSubmit={submitDeleteModal}>
          <input className="modal-submit-button" value="Delete" type="submit" />
          <button className="modal-close-button" onClick={cancelDeleteModal} type="button">Cancel</button>
        </form>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div id="loading">
        <div id="spinner" />
      </div>
    );
  }

  return (
    <div id="app">
      <div id="sidebar">
        <span id="sidebar-heading">Notes</span>
        <div id="options">
          <ul id="options-list">
            {
              _.map(notes, (note, index) => (
                <li key={index}>
                  <button
                    className={index === currentNote.index ? 'option selected' : 'option'}
                    onClick={() => selectNote(index)}
                    type="button"
                  >
                    {note.label}
                  </button>
                </li>
              ))
            }

          </ul>
        </div>
        <div id="edit-buttons">
          <button className="edit-button" onClick={openCreateModal} type="button">+</button>
          {(_.size(notes) > 1) && <button className="edit-button" onClick={openDeleteModal} type="button">-</button> }
          { showCreateModal && <CreateModal /> }
          { showDeleteModal && <DeleteModal /> }
        </div>
      </div>
      <div id="main">
        <div id="content-wrapper">
          <div id="tag-search">
            <div id="available-tags">
              {
                _.map(allTags, tag => (
                  <button
                    className={(filterTag === tag) ? 'available-tag selected' : 'available-tag'}
                    key={tag}
                    onClick={() => selectTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                ))
              }
            </div>
            {/* <input id='tag-search-input' type='text'></input> */}
          </div>
          <textarea id="text-area" onChange={onEdit} style={{ fontSize: '14px' }} value={visibleText} />
        </div>
      </div>
    </div>
  );
}

export default App;
