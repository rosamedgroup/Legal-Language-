import React from 'react';

const SkeletonBar: React.FC<{ width?: string; height?: string }> = ({ width = 'w-full', height = 'h-4' }) => (
    <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

const SkeletonLoader: React.FC = () => {
    return (
        <div className="lg:flex lg:gap-8">
            {/* TOC Skeleton */}
            <aside className="lg:w-1/4 xl:w-1/5">
                <div className="space-y-6 pr-4">
                    {/* TOC Title */}
                    <SkeletonBar width="w-3/4" height="h-6" />
                    {/* TOC Search */}
                    <SkeletonBar width="w-full" height="h-10" />
                    {/* TOC Items */}
                    <div className="space-y-4 pt-4">
                        <SkeletonBar width="w-5/6" />
                        <SkeletonBar width="w-4/6" />
                        <SkeletonBar width="w-3/4" />
                        <SkeletonBar width="w-5/6" />
                        <SkeletonBar width="w-2/3" />
                        <SkeletonBar width="w-3/4" />
                    </div>
                </div>
            </aside>

            {/* Content Skeleton */}
            <div className="flex-1 mt-12 lg:mt-0 bg-white p-6 md:p-10 rounded-lg border border-gray-200">
                <div className="space-y-12">
                    {/* Introduction Section Skeleton */}
                    <div className="space-y-6 pb-8 border-b-2 border-gray-200">
                        <SkeletonBar width="w-1/2" height="h-10" />
                        <div className="space-y-3">
                            <SkeletonBar />
                            <SkeletonBar width="w-11/12" />
                            <SkeletonBar width="w-5/6" />
                        </div>
                    </div>

                    {/* Content Section 1 Skeleton */}
                    <div className="space-y-6">
                        <SkeletonBar width="w-1/3" height="h-8" />
                        <div className="space-y-4">
                            <SkeletonBar />
                            <SkeletonBar width="w-11/12" />
                            <SkeletonBar />
                            <SkeletonBar width="w-5/6" />
                        </div>
                    </div>
                    
                    {/* Content Section 2 Skeleton */}
                    <div className="space-y-6">
                        <SkeletonBar width="w-1/2" height="h-8" />
                        <div className="space-y-4">
                            <SkeletonBar />
                            <SkeletonBar width="w-11/12" />
                            <SkeletonBar width="w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoader;