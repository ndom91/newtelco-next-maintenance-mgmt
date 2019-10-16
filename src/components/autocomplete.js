import { connectAutoComplete } from 'react-instantsearch-dom';

const Autocomplete = ({ hits, currentRefinement, refine }) => (
  <ul>
    <li>
      <input
        type="search"
        value={currentRefinement}
        onChange={event => refine(event.currentTarget.value)}
      />
    </li>
    {hits.map(hit => (
      <li key={hit.objectID}>{hit.name}</li>
    ))}
  </ul>
);

const CustomAutocomplete = connectAutoComplete(Autocomplete);