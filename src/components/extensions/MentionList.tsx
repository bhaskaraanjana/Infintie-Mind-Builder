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
            props.command({ id: item.title, label: item.title })
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

    return (
        <div className={styles.items}>
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`${styles.item} ${index === selectedIndex ? styles.isSelected : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.title}
                    </button>
                ))
            ) : (
                <div className={styles.item}>No result</div>
            )}
        </div>
    )
})
