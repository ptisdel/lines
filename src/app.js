import _ from 'lodash-es';
import './app.css';
import { useApp } from './app-hook';

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

  const CreateModal = () => {
    return <div className='modal-overlay'>
      <div className='modal'>
        <div className='modal-header'>
          <div className='modal-title'>
            Name Your Note
          </div>
        </div>
        <form className='modal-form' onSubmit={submitCreateModal}>
          <input autoFocus className='modal-input' maxLength='10' name='noteName' type='text'/>
          <input className='modal-submit-button' value='Submit' type='submit'/>
          <button className='modal-close-button' onClick={cancelCreateModal}>Cancel</button>
        </form>
      </div>
    </div>
  };

  const DeleteModal = () => {
    return <div className='modal-overlay'>
      <div className='modal'>
        <div className='modal-header'>
          <div className='modal-title'>
            Delete '{currentNote.label}'?
          </div>
        </div>
        <form className='modal-form' onSubmit={submitDeleteModal}>
          <input className='modal-submit-button' value='Delete' type='submit'/>
          <button className='modal-close-button' onClick={cancelDeleteModal}>Cancel</button>
        </form>
      </div>
    </div>
  };

  if (isLoading) return (
    <div id='loading'>
      <div id='spinner'/>
    </div>
  );
  
  return (
    <div id='app'>
      <div id='sidebar'>
        <span id='sidebar-heading'>Notes</span>
        <div id='options'>
          <ul id='options-list'>
            { 
              _.map(notes, (note, index) =>
                <li className={index === currentNote.index ? 'option selected' : 'option'} key={index} onClick={() => selectNote(index)}>{note.label}</li>
              ) 
            }
            
          </ul>
        </div>
        <div id='edit-buttons'>
          <div className='edit-button' onClick={openCreateModal}>+</div>
          {(_.size(notes) > 1) && <div className='edit-button' onClick={openDeleteModal}>-</div> }
          { showCreateModal && <CreateModal/> }
          { showDeleteModal && <DeleteModal/> }
        </div>
      </div>
      <div id='main'>
        <div id='content-wrapper'>
          <div id='tag-search'>
            <div id='available-tags'>
              {
                _.map(allTags, tag => 
                  <div className={ (filterTag === tag) ? 'available-tag selected' : 'available-tag'} key={tag} onClick={() => selectTag(tag)}>{tag}</div>
                ) 
              }
            </div>
            {/* <input id='tag-search-input' type='text'></input> */}
          </div>
          <textarea id='text-area' onChange={onEdit} style={{ fontSize: '14px' }} value={visibleText}/>
        </div>
      </div>
    </div>
  );
}

export default App;
