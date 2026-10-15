import Markdown from 'react-markdown';

export function ItineraryText({ children }: { children: string }) {
  return <div className="itinerary-text"><Markdown
    skipHtml
    disallowedElements={['img']}
    components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}
  >{children}</Markdown></div>;
}
