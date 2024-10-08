import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

function RoadMap({ selectedCareer }) {
  const [activeTab, setActiveTab] = useState('Educational Milestones');
  const [roadMapData, setRoadMapData] = useState([])
  const [completedTasks, setCompletedTasks] = useState({});
  const [milestones, setMilestones] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [LoadMessage, setLoadMessage] = useState('')
  const t = useTranslations('RoadMap');

  const language = localStorage.getItem('language') || 'en';


  // const getRoadmap = async () => {
  //     setIsLoading(true)
  //     // Clearing previous state before fetching new data
  //     setRoadMapData([]);
  //     setMilestones([]);
  //     setCompletedTasks({});
  //     try {
  //         const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  //         const response = await GlobalApi.GetRoadMapData(selectedCareer.career_group_id, token);
  //         if (response.status === 200) {  // Check for a 200 status code
              
  //             const results = response.data
  //             console.log(results)
  //             setRoadMapData(results);

  //         } else {
  //             toast.error('Failed to fetch RoadMap data. Please try again later.');
  //         }
  //     } catch (err) {
  
  //         if (err.response && err.response.data && err.response.data.message) {
  //         toast.error(`Error: ${err.response.data.message}`);
  //         } else {
  //         toast.error('Failed to fetch Road Map data. Please try again later.');
  //         }
  //     } finally {
  //         setIsLoading(false)
  //     }
  // }
  const requestIdRef = useRef(0); // Create a ref to track the request ID

  const getRoadmap = async () => {
    setIsLoading(true);
    // Clearing previous state before fetching new data
    setRoadMapData([]);
    setMilestones([]);
    setCompletedTasks({});
    setLoadMessage(t('loadingMessage'));


    const currentRequestId = ++requestIdRef.current; // Increment the request ID
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetRoadMapData(selectedCareer.id, token, language);
      // console.log("GetRoadMapData",response.data)
      // Check for the response status
      if (response.status === 200) {  // Successful response
        if (currentRequestId === requestIdRef.current) { // Ensure this is the latest request
          const results = response.data;
          console.log(results);
          setRoadMapData(results);
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error(t('errorMessages.fetchFailure'));
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(()=>{
    getRoadmap()
  }, [selectedCareer])
  
  console.log("selectedCareer", selectedCareer);

  useEffect(()=>{

    if(roadMapData.length>0){
      // Extract milestones from selectedCareer
      const milestones = roadMapData.reduce((acc, milestone) => {
        const { milestoneCategoryName, ...milestoneData } = milestone;
        if (!acc[milestoneCategoryName]) {
          acc[milestoneCategoryName] = [];
        }
        acc[milestoneCategoryName].push(milestoneData);
        return acc;
      }, {});
      setMilestones(milestones)
    }

  }, [roadMapData])
  
  const handleComplete = async (tab, milestoneId) => {
    const isCompleted = !completedTasks[tab]?.[milestoneId];
    setCompletedTasks((prevState) => ({
      ...prevState,
      [tab]: {
        ...prevState[tab],
        [milestoneId]: isCompleted,
      },
    }));
  
    try {
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = {
        milestoneId,
        completed: isCompleted,
      };
  
      const response = await GlobalApi.UpdateMileStoneStatus(data, token);
  
      if (response.status === 201) {
        toast.success(t('errorMessages.updateSuccess'));
      } else {
        const errorMessage = response.data?.message || t('errorMessages.updateFailure');
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      // Handle any errors that occurred during the API call
      toast.error(t('errorMessages.unexpectedError'));
    } finally {
      getRoadmap()
    }
  };

  return (
    <div className="p-4 bg-white">

       {/* Loading Message */}
       {/* {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-700">Generating roadmap data, please wait...</p>
        </div> */}
        {!milestones ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-700">{LoadMessage}</p>
          </div>
        ):(
          <>
            {/* Tabs */}
            <div className="flex mb-4 max-md:grid max-md:grid-cols-2 max-md:gap-1 lg:gap-2">
              {Object.keys(milestones).map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 px-4 py-2 lg:py-3 font-semibold lg:text-lg text-sm text-center focus:outline-none ${
                    activeTab === tab
                      ? 'bg-orange-400 text-white'
                      : 'bg-green-300 text-black hover:bg-green-400'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-orange-100 p-6 shadow-lg min-h-[300px]">
              
              {milestones[activeTab]?.length > 0 ? (
                milestones[activeTab]?.map((item) => (
                  <div key={item.milestoneId} className="mb-6 flex sm:flex-row flex-col max-md:gap-2 items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black">
                        {/* • {item.milestoneTitle}: <span className="font-normal">{item.milestoneDescription}</span> */}
                        • <span className="font-normal">{item.milestoneDescription}</span>

                      </h3>
                      {/* <p className="italic text-gray-700">(How To: {item.milestoneHowTo})</p> */}
                    </div>
                    <button
                      onClick={() => handleComplete(activeTab, item.milestoneId)}
                      className={`ml-4 px-4 py-2 font-semibold text-white rounded-lg flex items-center justify-center w-[150px] ${
                        item.milestoneCompletionStatus ? 'bg-green-500' : 'bg-sky-500'
                      }`}
                    >
                      {item.milestoneCompletionStatus ? (
                        <>
                          <CheckCircle className="mr-2" /> {t('buttons.completed')}
                        </>
                      ) : (
                        t('buttons.complete')
                      )}
                    </button>

                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">{LoadMessage}</p>
              )}
            </div>
            </>
          )}
    </div>
  );
}

export default RoadMap;
