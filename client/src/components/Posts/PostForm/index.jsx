import styles from './PostForm.module.css';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePost } from 'hooks/usePost';
import { UserContext } from 'contexts/UserContext';
import { postValidator } from 'utils/validationSchemas.utils';
import PostContainer from 'components/Posts/PostContainer';
import defaultProfilePic from 'assets/images/default-profile-pic.jpg';
import Loader from 'components/Loader';
import EmojiPicker from 'components/EmojiPicker';
import IconDelete from 'components/Icons/IconDelete';

const PostForm = ({ refreshPostList, editMode, setEditMode, content, imagePath }) => {
  const { createPost, updatePost } = usePost();
  const { currentUser } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const [responseErrorMsg, setResponseErrorMsg] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const { formState, handleSubmit, register, reset, setValue, getValues, setFocus } = useForm({
    mode: 'onSubmit'
  });
  const { errors } = formState;
  const validationSchema = postValidator();
  const imagesUrl = process.env.REACT_APP_IMAGES_URL;

  useEffect(() => {
    setResponseErrorMsg([]);
    if (editMode) {
      setValue('content', content);
      setFocus('content');
      imagePath && setFilePreview(`${imagesUrl}/${imagePath}`);
    }
  }, []);

  const adjustTextareaHeight = (e) => {
    e.target.style.height = '1px';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handlePreview = (e) => {
    if (e.target?.files?.[0]) {
      setFilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const emojiHandler = (emoji) => {
    const value = getValues('content');
    setValue('content', `${value}${emoji.native}`);
    setFocus('content');
  };

  const onSubmit = async (data) => {
    setResponseErrorMsg([]);
    setLoading(true);
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('image', data.image[0]);
    const request = editMode ? updatePost : createPost;
    createPost(formData)
      .then(() => {
        reset({ content: '', image: [] });
        setFilePreview(null);
        refreshPostList();
      })
      .catch((err) => setResponseErrorMsg(err))
      .finally(() => setLoading(false));
  };

  return (
    <PostContainer>
      <form className={styles.PostForm} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.top_row}>
          <img
            // src={`${cloudinaryUrl}/${currentUser.profilePicPath}`}
            src={defaultProfilePic}
            alt=''
            className={styles.user_pic}
          />

          <span>
            {currentUser.firstname} {currentUser.lastname}
          </span>
        </div>

        <textarea
          placeholder={`Rediger un post...`}
          className={`form-textarea ${styles.content_textarea} ${errors.content ? 'error' : ''}`}
          onInput={(e) => adjustTextareaHeight(e)}
          onFocus={(e) => adjustTextareaHeight(e)}
          {...register('content', { validate: validationSchema.content })}
        />

        {!!errors.content?.message && <span className='form-alert'>{errors.content.message}</span>}

        {!!filePreview && (
          <div className={styles.image_preview_container}>
            <img className={styles.image_preview} src={filePreview} alt='' />
            <IconDelete size={32} color='#ffffff' />
          </div>
        )}

        {responseErrorMsg.length > 0 && (
          <ul className='alert alert-danger'>
            {responseErrorMsg.map((message, index) => (
              <li className='alert-li' key={index}>
                {message}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.bottom_row}>
          <div className={styles.emoji_image_group}>
            <EmojiPicker onEmojiSelect={emojiHandler} />
            <div>
              <label className='form-file-label' htmlFor='image'>
                {!filePreview ? 'Ajouter une image' : `Modifier l'image`}
              </label>

              {!!errors.image?.message && (
                <span className={`form-alert ${styles.image_error}`}>{errors.image.message}</span>
              )}
            </div>
          </div>

          {isLoading && <Loader grey={true} />}
          <input
            type='file'
            accept='image/*'
            id='image'
            className='form-file-input'
            onInput={handlePreview}
            {...register('image', { validate: validationSchema.image })}
          />

          <input
            type='submit'
            value='Publier'
            className={`${styles.submit_btn} btn btn-primary-grey`}
          />
        </div>
      </form>
    </PostContainer>
  );
};

export default PostForm;
