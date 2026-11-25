import { useState, type FormEvent, type KeyboardEvent } from 'react'

export function Composer({
  placeholder,
  disabled,
  onSend,
  footnote,
  autoFocus,
}: {
  placeholder: string
  disabled?: boolean
  onSend: (text: string) => void
  footnote?: string
  autoFocus?: boolean
}) {
  const [text, setText] = useState('')

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={submit}>
        <textarea
          rows={1}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          autoFocus={autoFocus}
        />
        <button className="btn btn--primary btn--sm" type="submit" disabled={!text.trim() || disabled}>
          Send
        </button>
      </form>
      {footnote && <p className="composer__foot">{footnote}</p>}
    </div>
  )
}
