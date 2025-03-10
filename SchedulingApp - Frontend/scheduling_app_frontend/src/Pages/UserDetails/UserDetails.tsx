import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserByUserIdQuery, useUpdateUserDetailsMutation } from '../../apis/authApi';
import { inputHelper, toastNotify } from '../../Helper';
import { MainLoader } from '../../Components/Page/Common';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const userDetailsData = {
  userName: "",
  name: "",
  password: "",
}; 

function UserDetails() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [updateUserDetails] = useUpdateUserDetailsMutation();
  const [userDetailsInput, setUserDetailsInput] = useState(userDetailsData);
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data } = useGetUserByUserIdQuery(id);
  
  useEffect(() => {
    if (data && data.result) {
      const tempData = {
        userName: data.result.userName,
        name: data.result.name,
        password: data.result.password
      };
      setUserDetailsInput(tempData);
    }
  }, [data]);

  console.log(data);

  const handleUserInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const tempData = inputHelper(e, userDetailsInput);
    setUserDetailsInput(tempData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    formData.append("UserName", userDetailsInput.userName ?? "");
    formData.append("Name", userDetailsInput.name ?? "");
    formData.append("Password", userDetailsInput.password ?? "");

    let response;

    if (id) {
      formData.append("Id", id);
      response = await updateUserDetails({ data: formData, id });

      if (!('error' in response)) {
        toastNotify("Informacije o korisniku su uspešno ažurirane!", "success");
        navigate("/");
      } else {
        toastNotify("Došlo je do greške prilikom ažuriranja korisničkih informacija!", "error");
      }
    }

    setLoading(false);
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='container text-center'>
      {loading && <MainLoader />}
      <form method="post" onSubmit={handleSubmit}>
        <h1 className="mt-5">Izmeni Informacije o Korisniku</h1>
        <div className='mt-5'>
          <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
            <label>Unesite Novo Korisničko Ime</label>
            <input
              type="text"
              className="form-control"
              placeholder="Unesite Novo Korisničko Ime"
              required
              name = "userName"
              value = {userDetailsInput.userName}
              onChange={handleUserInput}
            />
          </div>
          <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
            <label>Unesite Novo Ime</label>
            <input
              type="text"
              className="form-control"
              placeholder="Unesite Novo Ime"
              required
              name = "name"
              value={userDetailsInput.name}
              onChange={handleUserInput}
            />
          </div>
          <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
            <label>Unesite Novu Lozinku</label>
            <TextField
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Unesite Novu Lozinku"
                required
                name="password"
                value={userDetailsInput.password}
                onChange={handleUserInput}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
          </div>

          <div className='mt-5'>
            <button
              type='submit'
              className='btn btn-outlined rounded-pill text-white mx-2'
              style={{ width: "200px", backgroundColor:"#4da172" }}
              disabled={loading}>
                Ažuriraj
            </button>
            <button
              className="btn btn-outlined rounded-pill text-white mx-2"
              style={{ width: "200px", backgroundColor: "#999393" }}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}>
              Otkaži
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserDetails
