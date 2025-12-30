import { useParams } from 'react-router-dom';
import ListingDetailContent from '../components/Listings/ListingDetailContent';

const ListingDetailPage = () => {
  const { id } = useParams();

  return <ListingDetailContent listingId={id} />;
};

export default ListingDetailPage;
