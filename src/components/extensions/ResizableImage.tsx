import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

export const ResizableImage: React.FC<NodeViewProps> = (props) => {
    const { node, updateAttributes, deleteNode, selected } = props;
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(node.attrs.width || '100%');
    const imageRef = useRef<HTMLImageElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    const onResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        // Prevent default to avoid scrolling on touch
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        startXRef.current = clientX;

        if (imageRef.current) {
            startWidthRef.current = imageRef.current.offsetWidth;
        }

        if ('touches' in e) {
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
        } else {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    const handleMove = (currentX: number) => {
        const diffX = currentX - startXRef.current;
        const newWidth = Math.max(100, startWidthRef.current + diffX);
        setWidth(`${newWidth}px`);
    };

    const onMouseUp = () => handleEnd('mouse');
    const onTouchEnd = () => handleEnd('touch');

    const handleEnd = (type: 'mouse' | 'touch') => {
        setIsResizing(false);
        updateAttributes({ width: width });

        if (type === 'mouse') {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        } else {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }
    };

    // Alignment helper
    const setAlign = (align: 'left' | 'center' | 'right') => {
        updateAttributes({ align });
    };

    // Determine justify-content based on alignment
    const justifyContent = node.attrs.align === 'center' ? 'center' :
        node.attrs.align === 'right' ? 'flex-end' : 'flex-start';

    return (
        <NodeViewWrapper
            className="resizable-image-wrapper"
            style={{
                display: 'flex',
                justifyContent,
                position: 'relative',
                margin: '1rem 0'
            }}
        >
            <div
                className={`image-container ${selected ? 'selected' : ''}`}
                style={{ position: 'relative', display: 'inline-block' }}
            >
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    style={{
                        width: isResizing ? width : node.attrs.width,
                        maxWidth: '100%',
                        display: 'block',
                        borderRadius: '8px',
                        boxShadow: selected ? '0 0 0 2px var(--primary-500)' : 'none'
                    }}
                />

                {selected && (
                    <>
                        {/* Resize Value Display (while resizing) */}
                        {isResizing && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                pointerEvents: 'none'
                            }}>
                                {parseInt(String(width))}px
                            </div>
                        )}

                        {/* Resize Handle */}
                        <div
                            onMouseDown={onResizeStart}
                            onTouchStart={onResizeStart}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                width: '24px',
                                height: '24px',
                                backgroundColor: 'white',
                                border: '2px solid var(--primary-500)',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                                zIndex: 10,
                                touchAction: 'none'
                            }}
                        />

                        {/* Floating Toolbar */}
                        <div
                            className="image-toolbar glass"
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '4px',
                                padding: '4px',
                                borderRadius: '8px',
                                zIndex: 20
                            }}
                        >
                            <button onClick={() => setAlign('left')} className={node.attrs.align === 'left' ? 'active' : ''}><AlignLeft size={16} /></button>
                            <button onClick={() => setAlign('center')} className={node.attrs.align === 'center' ? 'active' : ''}><AlignCenter size={16} /></button>
                            <button onClick={() => setAlign('right')} className={node.attrs.align === 'right' ? 'active' : ''}><AlignRight size={16} /></button>
                            <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }}></div>
                            <button onClick={deleteNode} style={{ color: '#ff4444' }}><Trash2 size={16} /></button>
                        </div>
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};
