import React from "react";
import "./AIExperience.css";

const AIExperience = ({ onAskAI }) => {
    return (
        <section className="ai-experience">
            <div className="ai-experience-content">

                <div className="ai-experience-icon">
                    ✨
                </div>

                <p className="ai-experience-tag">
                    POWERED BY AI
                </p>

                <h2>
                    Meet your personal
                    <span> Food Assistant</span>
                </h2>

                <p className="ai-experience-description">
                    Not sure what you're craving?
                    Let Foodie AI help you discover the perfect dish
                    based on your taste, preferences and budget.
                </p>

                <div className="ai-experience-features">
                    <div>
                        <span>💰</span>
                        <p>Budget based</p>
                    </div>

                    <div>
                        <span>🍽️</span>
                        <p>Menu recommendations</p>
                    </div>

                    <div>
                        <span>🌱</span>
                        <p>Preference based</p>
                    </div>
                </div>

                <button
                    className="ai-experience-button"
                    onClick={onAskAI}
                >
                    <span>✨</span>
                    Ask Foodie AI
                    <span>→</span>
                </button>

            </div>
        </section>
    );
};

export default AIExperience;