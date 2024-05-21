import { useState } from 'react'

import './App.css'
import Button from '@mui/material/Button';
import ProfileCard from './Components/ProfileCard';
import { TextField } from '@mui/material';
import UserService from './services/UserService';

import backend_url from './config'; 

function App() {
  const userService = new UserService(backend_url);
  const [currentId, setCurrentId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const getUserInfos = (id) => {
    if (!id) {
      return;
    }
    userService.getUserInfo(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => alert(error));
  }

  const handleIdChange = (event) => {
    setCurrentId(Number(event.target.value));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div>
        <TextField
          value={currentId || ''}
          type='number'
          placeholder="Enter user ID"
          onChange={handleIdChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              getUserInfos(currentId);
            }
          }}
        />
      </div>
      <div>
        <Button
          sx={{
            backgroundColor: 'blue',
            marginTop: '10px',
          }}
          variant='contained'
          className='btn'
          onClick={() => getUserInfos(currentId)}
        >
          Get User Info
        </Button>
      </div>
      {!currentUser ? <p>No user information available</p> : <ProfileCard user={currentUser} />}
    </div>
  )
}

export default App