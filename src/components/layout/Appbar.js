import classes from './Appbar.module.css'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button as MuiButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Button from '../generic/Button'

function Appbar() {
  const navigate = useNavigate();

  return (
    <Box className={classes.container}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          {/* BAM Logo as a Button */}
          <MuiButton onClick={() => navigate('/')} >
            <img src="/FF-png-notxt.png" alt="FF Logo" className={classes.logo}/>
          </MuiButton>
          
          {/* Title */}
          <Typography 
            variant="h2" 
            component="div"
            className={classes.title}
          >
            Fit Finder
          </Typography>
          
          {/* Login Button */}
          <div className={classes.loginButton}>
            <Button
              text1="Login"
              onClickHandler={() => navigate('/login')}
            />
          </div>
          
          {/* Create Account Button */}
          <div className={classes.createAccountButton}>
            <Button
              text1="Create Account"
              onClickHandler={() => navigate('/newAccount')}
            />
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Appbar
