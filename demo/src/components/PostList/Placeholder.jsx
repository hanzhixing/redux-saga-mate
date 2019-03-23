export default () => (
    <>
        {
            [1, 2, 3, 4, 5].map((v, i) => (
                <tr key={i}><td colSpan="5" className="text-center">&nbsp;</td></tr>
            ))
        }
    </>
);
