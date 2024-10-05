"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const quizId = params.taskId;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };
    authCheck();
  }, [router]);

  useEffect(() => {
    const getQuizData = async () => {
      setIsLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetQuizData(quizId, token);
        setQuestions(resp.data.questions);
        setCurrentQuestionIndex(resp.data.quizProgress);
        if (resp.data.quizProgress > 0) {
          setShowAlert(true); // Set showAlert to true when resuming the quiz
        }
      } catch (error) {
        console.error("Error Fetching GetQuizData data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getQuizData();
  }, []);

  useEffect(() => {
    if (quizCompleted) {
      // setIsLoading(true)
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [quizCompleted, router]);

  // useEffect(() => {
  //   // setIsLoading(true)
  //   if (questions?.length > 0) {
  //     // Shuffle choices when the component mounts or when the question changes
  //     // const choices = questions[currentQuestionIndex].answers.map(answer => answer.text);
  //     const choices = questions[currentQuestionIndex]?.answers;
  //     setShuffledChoices(choices.sort(() => Math.random() - 0.5));
  //   }

  //   // setIsLoading(false)
  // }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]?.answers) {
      const choices = questions[currentQuestionIndex]?.answers;
      setShuffledChoices([...choices].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = () => {
    const answer = {
      questionId: questions[currentQuestionIndex].id,
      optionId: selectedChoice.id,
      optionText: selectedChoice.text,
      analyticId: selectedChoice.analyticId,
    };

    quizProgressSubmit(answer);

    if (currentQuestionIndex < questions.length - 1) {
      /* Api to save the progress */
      setSelectedChoice(null); // Resetting selected choice for the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      quizSubmit(); // Quiz finished, send data to API
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveQuizProgress(data, token, quizId);

      if (resp && resp.status === 201) {
        console.log("Response");
      } else {
        console.error("Failed to save progress. Status code:", resp.status);
        alert(
          "There was a problem saving your progress. Please check your internet connection."
        );
      }
    } catch (error) {
      console.error("Error submitting progress:", error.message);
      alert("There was an error saving your progress. Please try again later.");
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.SaveQuizResult(token);

      if (resp && resp.status === 201) {
        toast.success("Quiz Completed successfully!.");
      } else {
        // toast.error('Failed to create Challenge.');
        toast.error("Failed Submitted results");
      }
    } catch (error) {
      console.error("Error creating Submitting:", error);
      console.error("Error creating Submiting:", error.message);
      // toast.error('Error: Failed to create Challenge.');
      toast.error("Error Error: Failed to submit quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-center">
        <div>
          <div className="text-4xl font-semibold">
            Quiz Completed successfully
          </div>

          <p className="mt-4">
            Navigating to the Home page in {secondsRemaining} seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#009be8] h-20 my-4 justify-center items-center flex">
        <p className="text-white uppercase font-bold text-center">
          Personality Assessment Test
        </p>
      </div>
      {showAlert && <QuizProgressAlert />}
      <div className="mx-3 flex justify-center items-center">
        {questions.length > 0 && (
          <div className="mt-4 pt-5 flex flex-col gap-4 justify-center items-center mx-auto sm:w-4/5 w-full max-w-[800px] text-white rounded-2xl p-[1px] bg-[#0097b2]">
            <div className="">
              <p className="font-extrabold text-center">
                {" "}
                {currentQuestionIndex + 1}/12
              </p>
            </div>
            <div className="bg-[#1b143a] w-full p-3 rounded-2xl pt-6 ">
            <div>
              <p className="font-bold p-2 text-xl text-center mb-6">
                {questions[currentQuestionIndex]?.question}
              </p>
            </div>
              <div className="flex flex-col gap-5 w-full text-white">
                {shuffledChoices.map((choice, index) => (
                  <button
                    key={index}
                    className={cn(
                      `py-5 px-4 rounded-full hover:cursor-pointer
                   hover:text-black  transition duration-300 ease-in-out `,
                      selectedChoice?.id === choice.id
                        ? "bg-green-500"
                        : "bg-[#0070c0] hover:bg-green-500"
                    )}
                    onClick={() => handleChoiceSelect(choice)}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
              <div className="w-full justify-center items-center flex my-5">
                <div>
                  <button
                    className={`bg-[#7824f6] py-2 px-10 rounded-full text-white ${
                      selectedChoice ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={handleNext}
                    disabled={!selectedChoice}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
