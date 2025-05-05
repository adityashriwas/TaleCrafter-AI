import React from "react";
import { toast } from "react-toastify";
import { useState } from "react";

const Contact = () => {
  const notify = (message: string) => toast(message);
  const [result, setResult] = useState("");

  const onSubmit = async (event: any) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append(
      "access_key",
      `${process.env.NEXT_PUBLIC_FEEDBAKC_FORM_KEY}`
    );
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
    notify("Feedback submitted successfully!");
    setResult("Submit now");
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto p-4">
        <form onSubmit={onSubmit}>
          <input
            type="email"
            id="userInput"
            className="w-full mb-2 px-4 h-10 text-lg text-white bg-[#1c0f2b] border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            placeholder="Enter your email"
            required
            name="email"
          />
          <input
            type="text"
            id="userInput"
            className="w-full px-4 h-10 text-lg text-white bg-[#1c0f2b] border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            placeholder="Report a bug or give feedback"
            required
            name="message"
          />
          <button
            type="submit"
            className="mt-5 text-lg p-2 size-full bg-gray-800 text-white shadow-md hover:bg-gray-700 transition cursor-pointer rounded-xl"
          >
            {result ? result : "Submit now"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Contact;
