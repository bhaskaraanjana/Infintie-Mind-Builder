import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { Sparkles, X, ChevronRight } from 'lucide-react';

// Phase 1: Canvas Tour Steps (Simplified + Interactions)
const TOUR_STEPS = [
    {
        id: 'welcome',
        targetId: null,
        title: "Welcome to Infinite Mind! 🧠",
        content: "Your ideas deserve infinite space. Let's take a quick tour of your canvas.",
        position: 'center',
        actionType: 'button',
        buttonText: "Start Tour",
        shape: 'rect',
        phase: 1,
    },
    {
        id: 'settings',
        targetId: 'settings-button',
        title: "Your Settings ⚙️",
        content: "Access your profile, themes, data export, and preferences here. Click the button!",
        position: 'bottom-left',
        actionType: 'click-element',
        shape: 'circle',
        phase: 1,
    },
    {
        id: 'search',
        targetId: 'search-trigger',
        title: "Search Everything 🔍",
        content: "Find any note or cluster instantly. Click the search button!",
        position: 'bottom-right',
        actionType: 'click-element',
        shape: 'circle',
        phase: 1,
    },
    {
        id: 'minimap',
        targetId: 'minimap-toggle',
        title: "Minimap Navigation 🗺️",
        content: "See your entire canvas at a glance. Click to toggle!",
        position: 'top-left',
        actionType: 'click-element',
        shape: 'circle',
        phase: 1,
    },
    {
        id: 'view-controls',
        targetId: 'view-controls',
        title: "Zoom & Fit 🔎",
        content: "Zoom in/out or fit all notes to screen. Click the toolbar!",
        position: 'top',
        actionType: 'click-element',
        shape: 'pill',
        phase: 1,
    },
    {
        id: 'feedback',
        targetId: 'feedback-button',
        title: "Send Feedback 💬",
        content: "Found a bug? Have an idea? Click to send feedback!",
        position: 'top-right',
        actionType: 'click-element',
        shape: 'circle',
        phase: 1,
    },
    {
        id: 'canvas-basics',
        targetId: null,
        title: "Your Infinite Canvas ✨",
        content: "Pan by dragging. Zoom with scroll wheel or pinch. You're almost done!",
        position: 'center',
        actionType: 'button',
        buttonText: "Next Tip",
        shape: 'rect',
        phase: 1,
    },
    {
        id: 'interactions',
        targetId: null,
        title: "Power Moves ⚡",
        content: "• Double-tap (or double-click) to edit notes.\n• Hold (or right-click) to access options and properties.",
        position: 'center',
        actionType: 'button',
        buttonText: "Finish Tour",
        shape: 'rect',
        phase: 1,
    },
    {
        id: 'explore',
        targetId: null, // No spotlight
        title: "Explore Your Canvas 🚀",
        content: "We've created some example notes for you to get started. Navigate comfortably and double-click anywhere to create a new note.",
        position: 'center',
        actionType: 'button',
        buttonText: "Finish & Explore",
        shape: 'rect',
        phase: 1,
    }
];

interface SpotlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'circle' | 'rect' | 'pill';
}

export const OnboardingTour: React.FC = () => {
    const {
        onboardingStep,
        setOnboardingStep,
        completeOnboarding,
        setViewport,
    } = useStore();

    // Hooks MUST run unconditionally
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const clickListenerRef = useRef<(() => void) | null>(null);

    const currentStep = (onboardingStep >= 0 && onboardingStep < TOUR_STEPS.length)
        ? TOUR_STEPS[onboardingStep]
        : null;

    const isLastStep = onboardingStep === TOUR_STEPS.length - 1;

    const handleNext = useCallback(() => {
        if (isLastStep) {
            completeOnboarding();
        } else {
            setOnboardingStep(onboardingStep + 1);
        }
    }, [isLastStep, completeOnboarding, setOnboardingStep, onboardingStep]);

    // Update spotlight and attach click listener to target element
    useEffect(() => {
        // Clean up previous listener
        if (clickListenerRef.current) {
            clickListenerRef.current();
            clickListenerRef.current = null;
        }

        if (!currentStep?.targetId) {
            setSpotlightRect(null);
            return;
        }

        const element = document.getElementById(currentStep.targetId);
        if (!element) {
            setSpotlightRect(null);
            return;
        }

        const updateSpotlight = () => {
            const rect = element.getBoundingClientRect();
            const padding = currentStep.shape === 'circle' ? 6 : 8;
            setSpotlightRect({
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
                shape: (currentStep.shape as 'circle' | 'rect' | 'pill') || 'rect',
            });
        };

        setIsAnimating(true);
        updateSpotlight();
        setTimeout(() => setIsAnimating(false), 400);

        // Attach click listener to the ACTUAL element
        if (currentStep.actionType === 'click-element') {
            const clickHandler = (e: Event) => {
                e.stopPropagation();
                // Let the element's native click happen first, then advance
                setTimeout(() => handleNext(), 100);
            };
            element.addEventListener('click', clickHandler, { once: true, capture: true });

            // Store cleanup function
            clickListenerRef.current = () => {
                element.removeEventListener('click', clickHandler, { capture: true });
            };
        }

        window.addEventListener('resize', updateSpotlight);
        return () => {
            window.removeEventListener('resize', updateSpotlight);
            if (clickListenerRef.current) {
                clickListenerRef.current();
                clickListenerRef.current = null;
            }
        };
    }, [onboardingStep, currentStep, handleNext]);

    // Center viewport at start or on 'explore' step
    useEffect(() => {
        if (onboardingStep === 0 || currentStep?.id === 'explore') {
            setViewport({ x: 0, y: 0, scale: 1 });
        }
    }, [onboardingStep, currentStep, setViewport]);

    const handleSkip = () => {
        completeOnboarding();
    };

    const getPanelStyle = (): React.CSSProperties => {
        const isMobile = window.innerWidth < 768;
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 10001,
            maxWidth: isMobile ? '300px' : '380px',
            width: 'calc(100% - 32px)',
        };

        if (!spotlightRect || currentStep?.position === 'center') {
            return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

        const pos = currentStep?.position || 'bottom';
        switch (pos) {
            case 'bottom-left':
                return { ...base, top: spotlightRect.y + spotlightRect.height + 20, left: '20px' };
            case 'bottom-right':
                return { ...base, top: spotlightRect.y + spotlightRect.height + 20, right: '20px' };
            case 'top-left':
                return { ...base, bottom: window.innerHeight - spotlightRect.y + 20, left: '20px' };
            case 'top-right':
                return { ...base, bottom: window.innerHeight - spotlightRect.y + 20, right: '20px' };
            case 'top':
                return { ...base, bottom: window.innerHeight - spotlightRect.y + 20, left: '50%', transform: 'translateX(-50%)' };
            case 'right':
                return { ...base, top: spotlightRect.y, left: spotlightRect.x + spotlightRect.width + 20 };
            default:
                return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    const getSpotlightRadius = () => {
        if (!spotlightRect) return '16px';
        switch (spotlightRect.shape) {
            case 'circle':
                return '50%';
            case 'pill':
                return '9999px';
            default:
                return '16px';
        }
    };

    // SVG mask approach for accurate spotlight
    const renderSpotlightOverlay = () => {
        if (!spotlightRect) {
            return (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 10000,
                        pointerEvents: 'auto',
                    }}
                />
            );
        }

        const { x, y, width, height, shape } = spotlightRect;

        return (
            <svg
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 10000,
                    pointerEvents: 'none',
                }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {shape === 'circle' ? (
                            <ellipse
                                cx={x + width / 2}
                                cy={y + height / 2}
                                rx={width / 2}
                                ry={height / 2}
                                fill="black"
                            />
                        ) : (
                            <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                rx={shape === 'pill' ? height / 2 : 12}
                                ry={shape === 'pill' ? height / 2 : 12}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#spotlight-mask)"
                    style={{
                        transition: isAnimating ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    }}
                />
            </svg>
        );
    };

    // Conditional Rendering moved to END to satisfy Hook Rules
    if (onboardingStep < 0 || !currentStep) return null;

    return (
        <>
            {/* Overlay with spotlight hole */}
            {renderSpotlightOverlay()}

            {/* Spotlight ring glow */}
            {spotlightRect && (
                <div
                    style={{
                        position: 'fixed',
                        left: spotlightRect.x - 4,
                        top: spotlightRect.y - 4,
                        width: spotlightRect.width + 8,
                        height: spotlightRect.height + 8,
                        border: '3px solid var(--primary-400)',
                        borderRadius: getSpotlightRadius(),
                        boxShadow: '0 0 20px var(--primary-400), 0 0 40px var(--primary-300)',
                        zIndex: 10002,
                        pointerEvents: 'none',
                        animation: 'onboardingPulse 2s infinite',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                />
            )}

            {/* Instruction Panel */}
            <div
                className="glass"
                style={{
                    ...getPanelStyle(),
                    padding: window.innerWidth < 768 ? '16px' : '24px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
                    animation: 'onboardingSlideUp 0.3s ease-out',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} style={{ color: 'var(--primary-500)' }} />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: 'var(--primary-600)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Step {onboardingStep + 1} of {TOUR_STEPS.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSkip}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--neutral-400)',
                            borderRadius: '4px',
                            display: 'flex',
                        }}
                        title="Skip tour"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: window.innerWidth < 768 ? '16px' : '18px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: 'var(--text)',
                    lineHeight: 1.3,
                }}>
                    {currentStep?.title}
                </h2>

                {/* Content */}
                <p style={{
                    fontSize: window.innerWidth < 768 ? '13px' : '14px',
                    lineHeight: 1.5,
                    color: 'var(--neutral-600)',
                    marginBottom: '16px'
                }}>
                    {currentStep?.content}
                </p>

                {/* Progress dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '16px'
                }}>
                    {TOUR_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: idx === onboardingStep ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                backgroundColor: idx <= onboardingStep
                                    ? 'var(--primary-500)'
                                    : 'var(--neutral-200)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>

                    {/* Primary Action Button (for 'button' type steps) */}
                    {currentStep?.actionType === 'button' && (
                        <button
                            onClick={handleNext}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                backgroundColor: 'var(--primary-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            {currentStep.buttonText}
                            <ChevronRight size={16} />
                        </button>
                    )}

                    {/* Manual Next Button (Fail-safe) */}
                    {(currentStep?.actionType !== 'button') && (
                        <button
                            onClick={handleNext}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                backgroundColor: 'white',
                                color: 'var(--neutral-700)',
                                border: '1px solid var(--neutral-300)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                        >
                            Next Step
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>

            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes onboardingPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.02); }
                }
                @keyframes onboardingSlideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};
