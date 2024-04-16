import { useState } from 'react'

import './App.css'
import { User } from './Models/User'
import Button from '@mui/material/Button';
import ProfileCard from './Components/ProfileCard';
import { TextField } from '@mui/material';
import UserService from './services/UserService';

function App() {
  const userServices = new UserService('http://localhost:3000');
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getUserInfos = (id: number | null) => {
    if (!id) {
      return;
    }
    userServices.getUserInfo(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => alert(error));
    console.log('User info:', currentUser);
  }

  const handleIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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