import { useEffect, useState } from 'react';
import axios from 'axios';

const usePaginatedAPI = ({ url, limit = 10 }) => {
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = async currentPage => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}?page=${currentPage}&limit=${limit}`);
      setData(res.data.rows);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return {
    data,
    page,
    pageCount: Math.ceil(totalCount / limit),
    onPageChange: setPage,
    isLoading,
  };
};

export default usePaginatedAPI;
