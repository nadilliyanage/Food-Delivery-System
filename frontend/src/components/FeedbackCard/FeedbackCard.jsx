import React from "react";
import { MdDelete, MdPushPin } from "react-icons/md";
import Button from "../Button/Button";

const FeedbackCard = ({
  username,
  feedback,
  onClearFeedback,
  onPinFeedback,
  isPinned,
}) => {
  return (
    <div className="bg-white border rounded-md p-4 shadow-md transition-transform duration-300 hover:scale-105">
      <h2 className="text-xl font-semibold">{username}</h2>
      <p className="mt-2 text-gray-700">{feedback}</p>

      {/* Conditionally render the Clear Feedback button only if onClearFeedback is provided */}
      {onClearFeedback && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              console.log("Clear feedback clicked!"); // Log to check button click
              onClearFeedback();
            }}
            className="inline-flex items-center gap-2 bg-red-600 py-1 rounded-md px-2 text-white"
          >
            Clear Feedback <MdDelete className="text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
