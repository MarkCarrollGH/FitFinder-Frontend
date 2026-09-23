import classes from './ImageProfile.module.css';
import { useRouter } from 'next/router';

function ImageProfile(props) {
  const router = useRouter();

  return (
    <li key={props.id} className={classes.item}>
        <div className={classes.image}>
            <img src={props.img_url}/>
        </div>
        <div className={classes.content}>
            <h3>{props.name}</h3>
            <h3>{props.brand}</h3> 
        </div>
    </li>
  );
}

export default ImageProfile;
