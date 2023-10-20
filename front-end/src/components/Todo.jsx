// hooks
import { useState, useEffect } from "react";

// todo api
import { getAllTodo, addTodo, deleteTodo } from "../api/todoApi";

// token api
import { checkAccessToken, checkRefreshToken } from "../api/verifyToken";

// react-router-dom imports
import { NavLink, useNavigate } from "react-router-dom";

// react-query imports
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// components
import Modal from "./Modal";

export default function Todo() {
  const [todo, setTodo] = useState(() => "");
  const [todoList, setTodoList] = useState(() => {});
  const [editTodo, setEditTodo] = useState(() => {});

  const [render, setRender] = useState(() => false);

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("token")?.split(",")[1];
  });

  const [showModal, setShowModal] = useState(() => false);

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const navigate = useNavigate();

  // for fetching data(todos)
  // for CRUD opearation
  const queryClient = useQueryClient();

  const { isLoading, isError } = useQuery({
    queryKey: ["todo"],
    queryFn: async () => {
      const data = await getAllTodo(username);
      handleVerification(token);
      setTodoList(data.data);
      return data;
    },
  });

  const { mutateAsync: addTodoMutationAsync, status } = useMutation({
    mutationFn: async ({ todo, username }) => {
      const data = await addTodo(todo, username);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([["todo"]]);
    },
  });

  const { mutateAsync: deleteTodoMutationAsync } = useMutation({
    mutationFn: (id) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["todo"]);
    },
  });

  // NOTE finish the migration to tanstackquery
  // you've done the deleteTodo and you are invalidating the query
  // meaning you're refetching the data whenever a todo is deleted
  // do that for the rest(addTodo, editTodo)

  useEffect(() => {
    setToken(() => {
      const storage = localStorage.getItem("token");

      if (storage !== null) return storage;

      return null;
    });

    if (username === undefined) navigate("/");
  }, []);

  // function to clear the local storage when logging out
  const handleLogout = () => {
    localStorage.clear();
  };

  // function to handle verification
  const handleVerification = async () => {
    // split the the token with comma, and grab the index 0
    const accessRes = await checkAccessToken(token.split(",")[0]);

    // check whether the remove is true or false
    // if true the token is expire, if not u guess it
    if (accessRes.remove) {
      // request a new access token by providing the
      // refresh token which is index number 1
      const refreshRes = await checkRefreshToken(token.split(",")[1]);

      // if the refresh token is also expire
      if (refreshRes.remove) {
        // clear the storage
        localStorage.clear();

        // logout the user
        navigate("/");
      } else {
        // replace the token in the localstorage
        localStorage.clear();
        localStorage.setItem("token", refreshRes.token);

        // set the token state to a new one
        setToken(localStorage.getItem("token"));
      }
    }
  };

  return (
    <>
      <NavLink className="logout" onClick={handleLogout} to="/">
        Logout
      </NavLink>

      {showModal && (
        <Modal
          setShowModal={setShowModal}
          editTodo={editTodo}
          setEditTodo={setEditTodo}
          setRender={setRender}
        />
      )}

      <div className="todo-app">
        <div className="add-todo-container">
          <input
            type="text"
            placeholder="add todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
          <button
            className="add"
            onClick={async () => {
              // addTodo(todo, username);
              await addTodoMutationAsync({ todo: todo, username: username });
              // await handleVerification();
              setRender(true);
            }}
            disabled={isLoading}
          >
            Add
          </button>
        </div>

        <div className="todo-list-container">
          {isLoading && "Loading..."}
          {todoList !== undefined &&
            !isLoading &&
            !isError &&
            todoList.map((todo) => {
              return (
                <span key={todo.id}>
                  <p>{todo.task_taskname}</p>
                  <div className="button-container">
                    <button
                      className="delete"
                      onClick={() => {
                        // deleteTodo(todo.id);
                        deleteTodoMutationAsync(todo.id);
                        setRender(true);
                        handleVerification(token);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="edit"
                      onClick={() => {
                        setShowModal(true);
                        setEditTodo({
                          id: todo.id,
                          task_taskname: todo.task_taskname,
                        });
                        handleVerification(token);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </span>
              );
            })}
        </div>
      </div>
    </>
  );
}
