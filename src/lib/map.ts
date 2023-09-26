export const map = (
	value: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	clamp = false
) => {
	const percent = (value - x1) / (y1 - x1);
	const res = percent * (y2 - x2) + x2;

	if (clamp) {
		return Math.min(Math.max(res, x2), y2);
	}

	return res;
};
