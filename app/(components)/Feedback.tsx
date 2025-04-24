import React from 'react'
import { Button, Textarea } from "@nextui-org/react";

const Contact = () => {

  const [result, setResult] = React.useState("");
  
    const onSubmit = async (event:any) => {
      event.preventDefault();
      setResult("Sending....");
      const formData = new FormData(event.target);
  
      formData.append("access_key", `${process.env.NEXT_PUBLIC_FEEDBAKC_FORM_KEY}`);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
  
      const data = await response.json();
  
      if (data.success) {
        setResult("Form Submitted Successfully");
        event.target.reset();
      } else {
        console.log("Error", data);
        setResult(data.message);
      }
      setTimeout(() => {}, 3000);    
      setResult("Submit now")
    };


  return (
    <>
      <div className="flex justify-center items-center mb-4">
        <form onSubmit={onSubmit}>
        <Textarea
        className="w-[80vw]"
        placeholder="Give your feedback here..."
        name="message"
        classNames={{
          input: "mt-2 sm:px-3 sm:text-2xl bg-transparent",
        }}
      />
          <button 
          type='submit' 
          className="mt-5 text-xl p-2 size-full bg-gray-800 text-white shadow-md hover:bg-gray-700 transition cursor-pointer rounded-xl"
          >{result ? result: "Submit now"}</button>
        </form>
      </div>
      </>
  )
}

export default Contact