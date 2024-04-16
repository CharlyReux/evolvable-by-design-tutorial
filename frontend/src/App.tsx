import { useEffect, useState } from 'react'

import './App.css'
import UserService from './services/UserService'
import Button from '@mui/material/Button';
import ProfileCard from './Components/ProfileCard';
import { TextField } from '@mui/material';
import { SemanticResource } from '@evolvable-by-design/pivo';

function App() {
  const [userService, setUserService] = useState<UserService | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<SemanticResource | null>(null);

  useEffect(() => {
    UserService.forApiAtUrl("http://localhost:3000/openapi.json").then(setUserService)
  }, [])



  const getUserInfos = (id: number | null) => {
    if (!id) {
      return;
    }
    userService!.getUserInfo(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => alert(error));
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
      {!currentUser ? <p>No user information available</p> : <ProfileCard user={currentUser} deleteUser={userService!.deleteUser} />}
    </div>
  )
}

export default App