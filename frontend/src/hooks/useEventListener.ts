import { useEffect, useRef } from 'react'

type EventListenerTarget = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

export function useEventListener(
  target: EventListenerTarget | null | undefined,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions,
) {
  const listenerRef = useRef(listener)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    if (!target) {
      return
    }

    const subscribedListener: EventListener = (event) => {
      listenerRef.current(event)
    }

    target.addEventListener(type, subscribedListener, options)
    return () => target.removeEventListener(type, subscribedListener, options)
  }, [target, type, options])
}
