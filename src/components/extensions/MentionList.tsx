import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'

import styles from './MentionList.module.css'

export default forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            // Pass both label and noteId for proper wiki-link creation
            props.command({ id: item.id, label: item.label, noteId: item.noteId })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    // Don't render anything if no items
    if (!props.items.length) {
        return null
    }

    return (
        <div className={styles.items}>
            {props.items.map((item: any, index: number) => (
                <button
                    className={`${styles.item} ${index === selectedIndex ? styles.isSelected : ''}`}
                    key={index}
                    onClick={() => selectItem(index)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
})
