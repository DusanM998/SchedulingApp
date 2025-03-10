import React, { useState } from 'react'
import { useRegisterUserMutation } from '../apis/authApi'
import { useNavigate } from 'react-router-dom';
import { inputHelper, toastNotify } from '../Helper';
import apiResponse from '../Interfaces/apiResponse';
import { MainLoader } from '../Components/Page/Common';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { SD_Roles } from '../Utility/SD';

const userInputTemplate = {
    userName: "",
    password: "",
    role: "",
    name: "",
};

function Register() {

    const [registerUser] = useRegisterUserMutation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [imageToBeStore, setImageToBeStore] = useState<any>();
    const [userInputs, setUserInputs] = useState(userInputTemplate);
    const navigate = useNavigate();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const tempData = inputHelper(e, userInputs);
        setUserInputs(tempData);
    };

    const handleSelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const tempData = inputHelper(e, userInputs);
        setUserInputs(tempData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!imageToBeStore) {
            toastNotify("Molimo Vas dodajte sliku!", "error");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("UserName", userInputs.userName ?? "");
        formData.append("Password", userInputs.password ?? "") ;
        formData.append("Role", userInputs.role ?? "");
        formData.append("Name", userInputs.name?? "");
        formData.append("File", imageToBeStore);
    
        //registerUser mutacija sluzi za slanje POST zahteva na server
        /*const response: apiResponse = await registerUser({
          userName: userInput.userName,
          password: userInput.password,
          role: userInput.role,
          name: userInput.name,
          image: userInput.image
        });*/
        
        const response : apiResponse = await registerUser(formData);
        
        console.log(response.data);

        if (response.data) {
            toastNotify("Uspešna registracija!");
            navigate("/login");
        }
        else if(response.error){
            const errorMsg = response.error.data?.errorMessages?.[0] || "Došlo je do greške!";
            toastNotify(errorMsg, "error");
        }
    
        setLoading(false);
    }
    
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const imgType = file.type.split("/")[1];
            const validImgTypes = ["jpeg", "jpg", "png"];

            const isImgTypeValid = validImgTypes.filter((e) => {
                return e === imgType;
            });

            if (file.size > 5000 * 1024) {
                setImageToBeStore("");
                toastNotify("Veličina fajla mora biti manja od 5MB!", "error");
                return;
            }
            else if (isImgTypeValid.length === 0) {
                setImageToBeStore("");
                toastNotify("Fajl mora biti u jpeg, jpg ili png formatu!", "error");
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            setImageToBeStore(file);
            reader.onload = () => {
                setUserInputs((prev) => ({
                    ...prev,
                    image: reader.result as string, // Base64 za slanje na backend
                }));
            };
        }
    };
    

  return (
    <div className="container text-center">
      {loading && <MainLoader />}
      <form method='post' onSubmit={handleSubmit}>
        <h1 className='mt-5'>Registruj se</h1>
        <div className='mt-5'>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Unesite Korisničko Ime"
                    required
                    name = "userName"
                    value = {userInputs.userName}
                    onChange={handleInputChange}
                />
            </div>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Unesite Ime"
                    required
                    name = "name"
                    value={userInputs.name}
                    onChange={handleInputChange}
                />
            </div>
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <TextField
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Unesite Novu Lozinku"
                    required
                    name="password"
                    value={userInputs.password}
                    onChange={handleInputChange}
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
            <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
                <select
                    className="form-control form-select"
                    required
                    name = "role"
                    value={userInputs.role}
                    onChange={handleSelectChange}>
                    <option value="">--Izaberi Ulogu--</option>
                    <option value={`${SD_Roles.CUSTOMER}`}>Customer</option>
                    <option value={`${SD_Roles.ADMIN}`}>Admin</option>
                </select>
            </div>
            <div className='col-sm-6 offset-sm-3 col-xs-12 mt-4'>
                <input 
                    type='file'    
                    className="form-control"
                    accept="image/*"
                    name="image"
                    onChange={handleFileChange}
                />
            </div>
            <div className="mt-5">
                <button type="submit"
                    className="btn btn-outlined rounded-pill text-white mx-2"
                    style={{ width: "200px", backgroundColor:"#4da172" }}
                    disabled={loading}>
                    Registruj se
                    </button>
                    <button type="submit"
                    className="btn btn-outlined rounded-pill text-white mx-2"
                    style={{ width: "200px", backgroundColor:"#999393" }}
                        disabled={loading}
                        onClick={() => navigate("/")}>
                    Otkaži
                </button>
            </div>
        </div>
      </form>
    </div>
  )
}

export default Register
