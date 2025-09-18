import { on } from "events";

 type loginButtonProps = {
        buttonText: string;
        onClick: () => void;
    }


function LoginButton({buttonText, onClick}: loginButtonProps) {

   
  return (
    <button onClick={onClick}>
        {buttonText}
    </button>
  );
}

export default LoginButton;