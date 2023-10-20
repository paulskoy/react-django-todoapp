import { updateTodo } from "../api/todoApi";

// react-query imports
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Modal(props) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateTodoMutationAsync } = useMutation({
    mutationFn: async ({ taskname, id }) => {
      await updateTodo(taskname, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["todo"]);
    },
  });

  return (
    <div className="modal-container">
      <div className="modal">
        <input
          type="text"
          value={props.editTodo.task_taskname}
          onChange={(e) =>
            props.setEditTodo({
              ...props.editTodo,
              task_taskname: e.target.value,
            })
          }
        />
        <button
          className="submit"
          onClick={async () => {
            await updateTodoMutationAsync({
              taskname: props.editTodo.task_taskname,
              id: props.editTodo.id,
            });
            props.setRender(true);
            props.setShowModal(false);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
