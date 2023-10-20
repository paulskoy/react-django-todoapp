import { useState, useRef, useEffect } from "react";

// api
import { loginApi } from "../api/loginApi";

import { useNavigate } from "react-router-dom";

// redux imports
import { useDispatch } from "react-redux";

// custom reducers
import { updateIsLogin, updateUsername } from "../features/login/loginSlice";

// react-query
import { useQuery, useMutation } from "@tanstack/react-query";

export default function Login() {
  // to be able to call our custom reducer we need this
  const dispatch = useDispatch();

  // state that allows us to switch between sign up or sing in
  const [isSignUp, setIsSignUp] = useState(() => false);

  // state to store our data, note that the key should match
  // the backend fields
  const [data, setData] = useState(() => {
    return { user_username: "", user_password: "", confirm_password: "" };
  });

  // when switching between sign in and sign up
  // form should not be submitted immediately
  // instead we want the user press the same button twice
  // for it to sign up

  // solution is store the previous value of the isSignUp
  // to the useRef so that if both are equal meaning the
  // user press the button two in a row
  const prevIsSignUp = useRef(!isSignUp);

  // state to store our messages
  const [message, setMessage] = useState(() => "");

  // assign the hook to a variable
  const navigate = useNavigate();

  // destructure the mutate function for us to be able to
  // call it down in the handleSubmit functioin
  const { mutateAsync: loginMutationAsync } = useMutation({
    // NOTE that the mutationFn only takes one argument
    // so if u need to pass two argument u may want
    // to store it to an object
    mutationFn: async ({ endpoint, payload }) => {
      // use await because it's good that the request should
      // resolved first before the codes below (setMessage, dispatch)
      // can be executed
      if (endpoint === "verifyuser") {
        const response = await loginApi(endpoint, payload);
        // set the local storage's value
        localStorage.setItem("token", response.token);

        // set the message
        setMessage(response.message);

        // set the login
        dispatch(updateIsLogin(response.login));

        // update the user
        dispatch(updateUsername(response.user_username));
      } else {
        const response = await loginApi(endpoint, payload);

        // set the message
        setMessage(response.message);
      }
    },
  });

  //   handle the clearing of the fields when switching from sign up to sing in
  useEffect(() => {
    setData({ user_username: "", user_password: "", confirm_password: "" });
    setMessage("");
  }, [isSignUp]);

  // handle the change of isSignUP
  const handleIsSignUp = (page) => {
    prevIsSignUp.current = isSignUp;
    page === "sign up" ? setIsSignUp(true) : setIsSignUp(false);
  };

  //   handle submition
  const handleSumbit = async (e, data) => {
    e.preventDefault();

    // before proceeding to submit the form check first if the
    // prev sign up value is equal to the current isSignUp value
    if (prevIsSignUp.current === isSignUp) {
      if (isSignUp) {
        // check if the password matches
        if (data.user_password === data.confirm_password) {
          // send data to the backend
          await loginMutationAsync({ endpoint: "createuser", payload: data });
        } else {
          // if the password doesn't match output this
          setMessage(`pls match the password`);
        }
      } else {
        // verify the user
        await loginMutationAsync({ endpoint: "verifyuser", payload: data });

        const storage = localStorage.getItem("token");

        // check whether the return value of the storage
        // is not undefined(string), we need to do this
        // in order for our message to show up, because
        // navigate refreshes the page
        storage !== "undefined" && navigate("/todoapp");
      }
    }
  };

  return (
    <form className="login-container" onSubmit={(e) => handleSumbit(e, data)}>
      <h1>WELCOME!</h1>

      <div className="input-container">
        {/* render the confirm password when it's the sign up page */}
        <input
          type="username"
          placeholder="username or gmail"
          value={data.user_username}
          onChange={(e) => setData({ ...data, user_username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={data.user_password}
          onChange={(e) => setData({ ...data, user_password: e.target.value })}
          required
        />
        {isSignUp && (
          <input
            type="password"
            placeholder="confirm password"
            value={data.confirm_password}
            onChange={(e) =>
              setData({ ...data, confirm_password: e.target.value })
            }
            required
          />
        )}

        <span className={message === "" ? "message" : "message show"}>
          {message}
        </span>
      </div>

      <div className="button-container">
        <button
          type="submit"
          onClick={() => {
            handleIsSignUp("sign in");
          }}
        >
          Sign In
        </button>

        <button
          onClick={() => {
            handleIsSignUp("sign up");
          }}
          type="submit"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}
