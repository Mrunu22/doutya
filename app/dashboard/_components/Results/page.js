"use client";
import GlobalApi from "@/app/_services/GlobalApi";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl"; // Import useTranslations

function Results() {
  const [resultData, setResultData] = useState(null); // Set initial value to null
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const t = useTranslations("ResultsPage"); // Initialize translations

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true); // Set loading state to true when fetch starts
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const language = localStorage.getItem("language") || "en";
        const data = await GlobalApi.GetUserId(token, language);
        setResultData(data.data[0]); // Store the result data
      } catch (err) {
        // Handle error if necessary
      } finally {
        setIsLoading(false); // Set loading state to false when fetch completes
      }
    }
    fetchResults();
  }, []);

  const {
    description,
    strengths,
    weaknesses,
    opportunities,
    threats,
    most_suitable_careers,
  } = resultData || {}; // Destructure resultData safely

  if (isLoading) {
    // Show loading state while data is being fetched
    return (
      <div className="flex justify-center items-center w-full h-full px-3">
        <div className="bg-white text-black text-center py-10 px-6 rounded-xl w-full min-h-[60vh] flex justify-center items-center">
          <p className="text-2xl font-bold">{t("loading")}..</p>
        </div>
      </div>
    );
  }

  if (!resultData || Object.keys(resultData).length === 0) {
    // Render "No Results" when no data is found after loading
    return (
      <div className="flex justify-center items-center w-full h-full px-3">
        <div className="bg-white text-black text-center py-10 px-6 rounded-xl w-full min-h-[60vh] flex justify-center items-center">
          <p className="text-2xl font-bold">{"No Results"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto">
      <p className="text-center text-white text-3xl">{t("title")}</p>
      <div className="flex flex-col text-white gap-5">
        <div>
          <p>{t("description")}</p>
          <div className="bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer">
            <p>{description}</p>
          </div>
        </div>

        <div>
          <p>{t("strengths")}</p>
          <div className="md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600">
            {strengths ? (
              strengths.split(",").map((strength, index) => (
                <div
                  key={index}
                  className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer"
                >
                  {strength}
                </div>
              ))
            ) : (
              <div className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer">
                {t("loading")}
              </div>
            )}
          </div>
        </div>

        <div>
          <p>{t("weaknesses")}</p>
          <div className="md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600">
            {weaknesses ? (
              weaknesses.split(",").map((weakness, index) => (
                <div
                  key={index}
                  className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer"
                >
                  {weakness}
                </div>
              ))
            ) : (
              <div className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer">
                {t("loading")}
              </div>
            )}
          </div>
        </div>

        <div>
          <p>{t("opportunities")}</p>
          <div className="md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600">
            {opportunities ? (
              opportunities.split(",").map((opportunity, index) => (
                <div
                  key={index}
                  className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer"
                >
                  {opportunity}
                </div>
              ))
            ) : (
              <div className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer">
                {t("loading")}
              </div>
            )}
          </div>
        </div>

        <div>
          <p>{t("threats")}</p>
          <div className="md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600">
            {threats ? (
              threats.split(",").map((threat, index) => (
                <div
                  key={index}
                  className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer"
                >
                  {threat}
                </div>
              ))
            ) : (
              <div className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer">
                {t("loading")}
              </div>
            )}
          </div>
        </div>

        <div>
          <p>{t("careers")}</p>
          <div className="md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600">
            {most_suitable_careers ? (
              most_suitable_careers.map((careerObj, index) => (
                <div
                  key={index}
                  className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer"
                >
                  <p>{careerObj.career}</p>
                  <br />
                  <p className="text-amber-700 font-bold">
                    {t("matchPercentage")}:{" "}
                    {careerObj.match_percentage.match_percentage}%
                  </p>{" "}
                  {/* Display the match percentage */}
                </div>
              ))
            ) : (
              <div className="bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer">
                {t("loading")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
